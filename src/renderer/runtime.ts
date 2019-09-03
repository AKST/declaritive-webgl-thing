import {
  Element,
  Primative,
  PrimativeElement,
  Component,
  ComponentElement,
} from '/src/renderer/element.ts';
import {
  Fiber,
  PrimativeFiber,
  ComponentFiber,
  ComponentSchedule,
  createComponentScheduleFactory,
  ComponentScheduleFactory,
} from '/src/renderer/fiber';
import { ProgramContext } from '/src/renderer/program_context';
import { createHookStateFactory, HookStateFactory } from '/src/renderer/hook_state';

type ProgramContextFactory = (program?: WebGLProgram) => ProgramContext;

class Render {
  private rootFibers: Fiber[] = [];

  constructor(
      private readonly context: WebGLRenderingContext,
      private readonly programContextFactory: ProgramContextFactory,
      private readonly hookStateFactory: HookStateFactory,
      private readonly componentScheduleFactory: ComponentScheduleFactory,
  ) {
  }

  renderRoot(elements: Element[]): Fiber[] {
    const outerContext = this.programContextFactory();
    this.rootFibers = elements.map(element => this.renderElement(element, outerContext));
    this.paint();
    return this.rootFibers;
  }

  private renderElement(element: Element, programContext: ProgramContext): Fiber {
    switch (element.type) {
      case 'primative':
        return this.renderPrimative(element.primative, programContext);

      case 'component': {
        return this.renderComponent(element, programContext);
      }

      default:
        throw new Error(`unsuppported ui node: ${element}`);
    }
  }

  private renderComponent(element: ComponentElement<unknown>, programContext: ProgramContext): Fiber {
    const componentSchedule = this.componentScheduleFactory(this.updateComponent);
    const hookState = this.hookStateFactory(programContext, componentSchedule.updateFiber);
    const elementOutput = element.component(element.props, hookState);
    const childFiber = this.renderElement(elementOutput, programContext);
    const componentFiber = new ComponentFiber(
        programContext,
        hookState,
        element.component,
        element.props,
        childFiber,
    );
    hookState.onRenderFinish();
    componentSchedule.setFiber(componentFiber);
    return componentFiber;
  }

  private renderPrimative(primative: Primative, parentProgramContext: ProgramContext): Fiber {
    const createChildFibers = (programContext: ProgramContext): Fiber[] | undefined =>
        primative.props.children
            ? primative.props.children.map(element => this.renderElement(element, programContext))
            : undefined;

    switch (primative.type) {
      case 'set-program': {
        const { program } = primative.props;
        const programContext = this.programContextFactory(program);
        const childFibers = createChildFibers(programContext);
        return new PrimativeFiber(programContext, primative, childFibers);
      }

      default: {
        const childFibers = createChildFibers(parentProgramContext);
        return new PrimativeFiber(parentProgramContext, primative, childFibers);
      }
    }
  }

  private updateComponent = <T>(componentFiber: ComponentFiber<T>) => {
    const { component, props, hookState, programContext } = componentFiber;
    const elementOutput = component(props, hookState);
    hookState.onRenderFinish();

    // TODO: children update
    const childFiber = this.renderElement(elementOutput, programContext);
    const shouldUpdateChlidren = this.didFiberUpdate(childFiber, componentFiber.childFiber);
    componentFiber.setChildFiber(childFiber);

    if (shouldUpdateChlidren) {
      console.warn('child update not implemented');
    }
  };

  private didFiberUpdate(nextFiber: Fiber, currFiber: Fiber) {
    return true;
  }

  private paint = () => {
    this.rootFibers.forEach(fiber => this.paintFiber(fiber));
    requestAnimationFrame(this.paint);
  }

  private paintFiber(fiber: Fiber) {
    if (fiber instanceof ComponentFiber) {
      this.paintComponent(fiber);
    } else if (fiber instanceof PrimativeFiber) {
      this.paintPrimative(fiber);
    } else {
      throw new Error('unknown fiber');
    }
  }

  private paintComponent<T>({ childFiber }: ComponentFiber<T>) {
    if (childFiber) {
      this.paintFiber(childFiber);
    }
  }

  private paintPrimative({ childFibers, primative }: PrimativeFiber) {
    const paintChildren = () => {
      childFibers && childFibers.forEach(f => this.paintFiber(f));
    };

    switch (primative.type) {
      case 'fragment':
        paintChildren();
        break;

      case 'set-program': {
        this.context.useProgram(primative.props.program);
        paintChildren();
        break;
      }

      case 'set-uniform': {
        const { uniform: { location, type }, value } = primative.props;
        const contextMethodName: keyof WebGLRenderingContext = ('uniform' + type) as any;
        if (this.context[contextMethodName]) {
          (this.context[contextMethodName] as any)(location, ...value);
          paintChildren();
        } else {
          throw new Error(`unknown unform type, ${type}`);
        }
        break;
      }

      case 'set-attribute-data': {
        const { attribute: { location, size }, buffer, drawKind } = primative.props;
        this.context.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, buffer.buffer);
        this.context.bufferData(WebGLRenderingContext.ARRAY_BUFFER, buffer.data, buffer.kind);
        this.context.vertexAttribPointer(location, size, WebGLRenderingContext.FLOAT, false, 0, 0);
        this.context.enableVertexAttribArray(location);
        this.context.drawArrays(drawKind, 0, buffer.data.length / size);
        paintChildren();
        break;
      }

      default:
        throw new Error(`unsuppported primative: ${primative}`);
    }
  }
}

export function renderRoot(
    elements: Element[],
    context: WebGLRenderingContext,
    onComplete: (fiber: Fiber[]) => void,
) {
  const programContextFactory: ProgramContextFactory = program => new ProgramContext(context, program);
  const requestIdleCallback = (window.requestIdleCallback || window.setTimeout).bind(window);
  const cancelIdleCallback = (window.cancelIdleCallback || window.clearTimeout).bind(window);
  const renderer = new Render(
      context,
      programContextFactory,
      createHookStateFactory(requestIdleCallback),
      createComponentScheduleFactory(requestIdleCallback, cancelIdleCallback),
  );

  onComplete(renderer.renderRoot(elements));
}
