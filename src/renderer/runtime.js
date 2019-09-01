import {
  PrimativeFiber,
  ComponentFiber,
  ComponentSchedule,
  createComponentScheduleFactory,
} from '/src/renderer/fiber';
import { ProgramContext } from '/src/renderer/program_context';
import { createHookStateFactory } from '/src/renderer/hook_state';

class Render {
  constructor(
      context,
      programContextFactory,
      hookStateFactory,
      componentScheduleFactory
  ) {
    this._context = context;
    this._rootFibers = undefined;
    this._programContextFactory = programContextFactory;
    this._hookStateFactory = hookStateFactory;
    this._componentScheduleFactory = componentScheduleFactory;

    // Bound methods because class members aren't supported by parcel turns out.
    // - _paint is bound because it's passed to requestAnimationFrame
    // - _updateComponent is bound because it's passed a callback that
    //   will eventually get called by setState.
    this._paint = this._paint.bind(this);
    this._updateComponent = this._updateComponent.bind(this);
  }

  renderPrimative(primative, parentProgramContext) {
    const createChildFibers = (programContext) => primative.children
        ? primative.children.map(uiNode => this.renderUiNode(uiNode, programContext))
        : undefined;

    switch (primative.type) {
      case 'set-program': {
        const programContext = this._programContextFactory(primative.program);
        const childFibers = createChildFibers(programContext);
        return new PrimativeFiber(programContext, primative, childFibers);
      }

      default: {
        const childFibers = createChildFibers(parentProgramContext);
        return new PrimativeFiber(parentProgramContext, primative, childFibers);
      }
    }
  }

  renderUiNode(uiNode, programContext) {
    switch (uiNode.type) {
      case 'primative':
        return this.renderPrimative(uiNode.primative, programContext);

      case 'component': {
        const componentSchedule = this._componentScheduleFactory(this._updateComponent);
        const hookState = this._hookStateFactory(programContext, componentSchedule.updateFiber);
        const uiNodeOutput = uiNode.component(uiNode.props, hookState);
        const childFiber = this.renderUiNode(uiNodeOutput, programContext);
        const componentFiber = new ComponentFiber(
            programContext,
            hookState,
            uiNode.component,
            uiNode.props,
            childFiber,
        );
        hookState.onRenderFinish();
        componentSchedule.setFiber(componentFiber);
        return componentFiber;
      }

      default:
        throw new Error(`unsuppported ui node: ${uiNode.type}`);
    }
  }

  renderRoot(uiNodes) {
    this._rootFibers = uiNodes.map(uiNode => this.renderUiNode(uiNode, undefined));
    this._paint();
    return this._rootFibers;
  }

  _updateComponent(componentFiber) {
    const { component, props, hookState, programContext } = componentFiber;
    const uiNodeOutput = component(props, hookState);
    hookState.onRenderFinish();

    // TODO: children update
    const childFiber = this.renderUiNode(uiNodeOutput, programContext);
    const shouldUpdateChlidren = this._didFiberUpdate(childFiber, componentFiber.childFiber);
    componentFiber.setChildFiber(childFiber);

    if (shouldUpdateChlidren) {
      console.warn('child update not implemented');
    }
  }

  _didFiberUpdate(nextFiber, currFiber) {
    const nextIsComponent = nextFiber instanceof ComponentFiber;
    const currIsComponent = currFiber instanceof ComponentFiber;
    const nextIsPrimative = nextFiber instanceof PrimativeFiber;
    const currIsPrimative = currFiber instanceof PrimativeFiber;

    if (nextIsComponent && currIsComponent) {
      return this._didComponentUpdate(nextFiber, currFiber);
    } else if (nextIsPrimative && currIsPrimative) {
      return this._didPrimativeUpdate(nextFiber, currFiber);
    } else {
      return true;
    }
  }

  _didComponentUpdate(nextFiber, currFiber) {
    return currFiber.shouldUpdate(nextFiber);
  }

  _didPrimativeUpdate(nextFiber, currFiber) {
    // TODO
  }

  _paint() {
    this._rootFibers.forEach(fiber => this._paintFiber(fiber));
    requestAnimationFrame(this._paint);
  }

  _paintFiber(fiber) {
    if (fiber instanceof ComponentFiber) {
      this._paintComponent(fiber);
    } else if (fiber instanceof PrimativeFiber) {
      this._paintPrimative(fiber);
    } else {
      console.error(error);
      throw new Error('unknown fiber');
    }
  }

  _paintComponent({ childFiber }) {
    if (childFiber) {
      this._paintFiber(childFiber);
    }
  }

  _paintPrimative({ childFibers, primative }) {
    const paintChildren = () => {
      childFibers && childFibers.forEach(f => this._paintFiber(f));
    };

    switch (primative.type) {
      case 'fragment':
        paintChildren();
        break;

      case 'set-program': {
        this._context.useProgram(primative.program);
        paintChildren();
        break;
      }

      case 'set-uniform': {
        const { uniform: { location, type }, value } = primative;
        const contextMethodName = 'uniform' + type;
        if (this._context[contextMethodName]) {
          this._context[contextMethodName](location, ...value);
          paintChildren();
        } else {
          throw new Error(`unknown unform type, ${type}`);
        }
        break;
      }

      case 'set-attribute-data': {
        const { attribute: { location, size }, buffer } = primative;
        this._context.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, buffer.buffer);
        this._context.bufferData(WebGLRenderingContext.ARRAY_BUFFER, buffer.data, buffer.kind);
        this._context.vertexAttribPointer(location, size, WebGLRenderingContext.FLOAT, false, 0, 0);
        this._context.enableVertexAttribArray(location);
        this._context.drawArrays(primative.drawKind, 0, buffer.data.length / size);
        paintChildren();
        break;
      }

      default:
        throw new Error(`unsuppported primative: ${primative.type}`);
    }
  }
}

export function renderRoot(patch, context, onComplete) {
  const programContextFactory = (program) => new ProgramContext(context, program);
  const requestIdleCallback = window.requestIdleCallback.bind(window) || window.setTimeout.bind(window);
  const cancelIdleCallback = window.cancelIdleCallback.bind(window) || window.clearTimeout.bind(window);
  const renderer = new Render(
      context,
      programContextFactory,
      createHookStateFactory(requestIdleCallback),
      createComponentScheduleFactory(requestIdleCallback, cancelIdleCallback),
  );

  onComplete(renderer.renderRoot(patch));
}
