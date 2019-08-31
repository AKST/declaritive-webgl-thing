import {
  PrimativeFiber,
  ComponentFiber,
  ComponentSchedule,
} from '/src/renderer/fiber.js';
import { ProgramContext } from '/src/renderer/program_context.js';
import { createHookStateFactory } from '/src/renderer/hook_state.js';

class Render {
  constructor(context, programContextFactory, hookStateFactory) {
    this._context = context;
    this._rootFibers = undefined;
    this._programContextFactory = programContextFactory;
    this._hookStateFactory = hookStateFactory;

    // Bound methods because class members aren't supported by parcel turns out.
    this._paint = this._paint.bind(this);
    this._updateComponent = this._updateComponent.bind(this);
  }

  renderPrimative(primative, parentProgramContext) {
    switch (primative.type) {
      case 'fragment': {
        const childFibers = primative.children.map(uiNode => (
            this.renderUiNode(uiNode, parentProgramContext)
        ));
        return new PrimativeFiber(parentProgramContext, primative, childFibers);
      }

      case 'set-program': {
        this._context.useProgram(primative.program);
        const programContext = this._programContextFactory(primative.program);
        const childFibers = primative.children.map(uiNode => this.renderUiNode(uiNode, programContext));
        return new PrimativeFiber(programContext, primative, childFibers);
      }

      case 'set-uniform': {
        const { uniform: { location, type }, value } = primative;
        const contextMethodName = 'uniform' + type;
        if (this._context[contextMethodName]) {
          this._context[contextMethodName](location, ...value);
          const childFibers = primative.children.map(uiNode => (
              this.renderUiNode(uiNode, parentProgramContext)
          ));
          return new PrimativeFiber(parentProgramContext, primative, childFibers);
        } else {
          throw new Error(`unknown unform type, ${type}`);
        }
      }

      case 'set-attribute-data': {
        const { attribute: { location, size }, buffer } = primative;
        this._context.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, buffer.buffer);
        this._context.bufferData(WebGLRenderingContext.ARRAY_BUFFER, buffer.data, buffer.kind);
        this._context.vertexAttribPointer(location, size, WebGLRenderingContext.FLOAT, false, 0, 0);
        this._context.enableVertexAttribArray(location);
        this._context.drawArrays(primative.drawKind, 0, buffer.data.length / size);
        return new PrimativeFiber(parentProgramContext, primative, undefined);
      }

      default:
        throw new Error(`unsuppported primative: ${primative.type}`);
    }
  }

  renderUiNode(uiNode, programContext) {
    switch (uiNode.type) {
      case 'primative':
        return this.renderPrimative(uiNode.primative, programContext);

      case 'component':
        const componentSchedule = new ComponentSchedule(this._updateComponent);
        const hookState = this._hookStateFactory(programContext, () => componentSchedule.updateFiber());
        const uiNodeOutput = uiNode.component(uiNode.props, hookState);
        const childFiber = this.renderUiNode(uiNodeOutput, programContext);
        const componentFiber = new ComponentFiber(hookState, uiNode.component, uiNode.props, childFiber);
        componentSchedule.setFiber(componentFiber);
        return componentFiber;

      default:
        throw new Error(`unsuppported ui node: ${uiNode.type}`);
    }
  }

  renderRoot(uiNodes) {
    this._rootFibers = uiNodes.map(uiNode => this.renderUiNode(uiNode, undefined));
    return this._rootFibers;
  }

  _updateComponent(componentFiber) {
    console.log('updating', componentFiber);
  }

  _paint() {
  }
}

export function renderRoot(patch, context, onComplete) {
  const programContextFactory = (program) => new ProgramContext(context, program);
  const requestIdleCallback = window.requestIdleCallback || setTimeout;
  const renderer = new Render(
      context,
      programContextFactory,
      createHookStateFactory(requestIdleCallback),
  );
  onComplete(renderer.renderRoot(patch));
}
