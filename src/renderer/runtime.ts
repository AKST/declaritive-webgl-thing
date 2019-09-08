import {
  Element,
  Primative,
  PrimativeElement,
  Component,
  ComponentElement,
} from '/src/renderer/element.ts';
import {
  Node,
  PrimativeNode,
  ComponentNode,
} from '/src/renderer/state_tree/state_tree';
import {
  createNodeRefreshFactory,
  NodeRefreshFactory,
  NodeRefresh,
} from '/src/renderer/state_tree/node_refresh';
import { ProgramContext } from '/src/renderer/program_context';
import { createHookStateFactory, HookStateFactory } from '/src/renderer/hook_state';

type ProgramContextFactory = (program?: WebGLProgram) => ProgramContext;

class Render {
  private rootNodes: Node[] = [];

  constructor(
      private readonly context: WebGLRenderingContext,
      private readonly programContextFactory: ProgramContextFactory,
      private readonly hookStateFactory: HookStateFactory,
      private readonly nodeRefreshFactory: NodeRefreshFactory,
  ) {
  }

  renderRoot(elements: Element[]): Node[] {
    const outerContext = this.programContextFactory();
    this.rootNodes = elements.map(element => this.renderElement(element, outerContext));
    this.paint();
    return this.rootNodes;
  }

  private renderElement(element: Element, programContext: ProgramContext): Node {
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

  private renderComponent(element: ComponentElement<unknown>, programContext: ProgramContext): Node {
    const nodeRefresh = this.nodeRefreshFactory(this.updateComponent);
    const hookState = this.hookStateFactory(programContext, nodeRefresh.updateNode);
    const elementOutput = element.component(element.props, hookState);
    const childNode = this.renderElement(elementOutput, programContext);
    const componentNode = new ComponentNode(
        programContext,
        hookState,
        element.component,
        element.props,
        childNode,
    );
    hookState.onRenderFinish();
    nodeRefresh.setNode(componentNode);
    return componentNode;
  }

  private renderPrimative(primative: Primative, parentProgramContext: ProgramContext): Node {
    const createChildNodes = (programContext: ProgramContext): Node[] | undefined =>
        primative.props.children
            ? primative.props.children.map(element => this.renderElement(element, programContext))
            : undefined;

    switch (primative.type) {
      case 'set-program': {
        const { program } = primative.props;
        const programContext = this.programContextFactory(program);
        const childNodes = createChildNodes(programContext);
        return new PrimativeNode(programContext, primative, childNodes);
      }

      default: {
        const childNodes = createChildNodes(parentProgramContext);
        return new PrimativeNode(parentProgramContext, primative, childNodes);
      }
    }
  }

  private updateComponent = <T>(componentNode: ComponentNode<T>) => {
    const { component, props, hookState, programContext } = componentNode;
    const elementOutput = component(props, hookState);
    hookState.onRenderFinish();

    // TODO: children update
    const childNode = this.renderElement(elementOutput, programContext);
    const shouldUpdateChlidren = this.didNodeUpdate(childNode, componentNode.childNode);
    componentNode.setChildNode(childNode);

    if (shouldUpdateChlidren) {
      // TODO: Add updating children.
    }
  };

  private didNodeUpdate(nextNode: Node, currNode: Node) {
    return true;
  }

  private paint = () => {
    this.rootNodes.forEach(node => this.paintNode(node));
    requestAnimationFrame(this.paint);
  }

  private paintNode(node: Node) {
    if (node instanceof ComponentNode) {
      this.paintComponent(node);
    } else if (node instanceof PrimativeNode) {
      this.paintPrimative(node);
    } else {
      throw new Error('unknown node');
    }
  }

  private paintComponent<T>({ childNode }: ComponentNode<T>) {
    if (childNode) {
      this.paintNode(childNode);
    }
  }

  private paintPrimative({ childNodes, primative }: PrimativeNode) {
    const paintChildren = () => {
      childNodes && childNodes.forEach(f => this.paintNode(f));
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
    onComplete: (node: Node[]) => void,
) {
  const programContextFactory: ProgramContextFactory = program => new ProgramContext(context, program);
  const requestIdleCallback = (window.requestIdleCallback || window.setTimeout).bind(window);
  const cancelIdleCallback = (window.cancelIdleCallback || window.clearTimeout).bind(window);
  const renderer = new Render(
      context,
      programContextFactory,
      createHookStateFactory(requestIdleCallback),
      createNodeRefreshFactory(requestIdleCallback, cancelIdleCallback),
  );

  onComplete(renderer.renderRoot(elements));
}
