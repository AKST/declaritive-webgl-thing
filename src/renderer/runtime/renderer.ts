import { createRequestIdleCallback } from '/src/util/browser/request_idle_callback';
import {
  Element,
  Primative,
  ComponentElement,
  PrimativeElement,
  isComponentElement,
  isPrimativeElement,
} from '/src/renderer/element/element';
import { createHookStateFactory, HookStateFactory } from '/src/renderer/hook_state/hook_state';
import {
  createProgramContextFactory,
  ProgramContext,
  ProgramContextFactory,
} from '/src/renderer/program_context/program_context';
import { createNodeRefreshFactory, NodeRefreshFactory } from '/src/renderer/state_tree/node_refresh';
import {
  Node,
  PrimativeNode,
  ComponentNode,
  isComponentNode,
  isPrimativeNode,
} from '/src/renderer/state_tree/state_tree';

export type ProgramContextFactory = (program?: WebGLProgram) => ProgramContext;

export class Renderer {
  constructor(
      private readonly programContextFactory: ProgramContextFactory,
      private readonly hookStateFactory: HookStateFactory,
      private readonly nodeRefreshFactory: NodeRefreshFactory,
  ) {
  }

  createStateTree(element: Element): Node {
    const outerContext = this.programContextFactory();
    return this.renderElement(element, outerContext);
  }

  updateComponentEntryPoint = <T>(componentNode: ComponentNode<T>) => {
    this.updateComponentNode(componentNode, componentNode.props, componentNode.programContext);
  };

  private renderElement(element: Element, programContext: ProgramContext): Node {
    if (element instanceof PrimativeElement) {
      return this.renderPrimative(element.primative, programContext);
    }
    else if (element instanceof ComponentElement) {
      return this.renderComponent(element, programContext);
    }
    throw new Error(`unsuppported ui node: ${element}`);
  }

  private renderComponent<T>(element: ComponentElement<T>, programContext: ProgramContext): Node {
    const nodeRefresh = this.nodeRefreshFactory<T>(this.updateComponentEntryPoint);
    const hookState = this.hookStateFactory(programContext, nodeRefresh.updateNode);
    const elementOutput = element.component(element.props, hookState);
    const childNode = this.renderElement(elementOutput, programContext);
    const componentNode = new ComponentNode<T>(
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
        return new PrimativeNode(primative, childNodes);
      }

      default: {
        const childNodes = createChildNodes(parentProgramContext);
        return new PrimativeNode(primative, childNodes);
      }
    }
  }

  private updateOrReplaceNode(node: Node, output: Element, context: ProgramContext): Node {
    if (node.shouldRerender(output)) {
      return this.renderElement(output, context);
    }
    if (node.shouldUpdate(output)) {
      if (isComponentNode(node) && isComponentElement(output)) {
        this.updateComponentNode(node, output.props, context);
      } else if (isPrimativeNode(node) && isPrimativeElement(output)) {
        this.updatePrimativeNode(node, output.primative, context);
      } else {
        // this should have been picked up in the first guard conditional.
        throw new Error('should not occur');
      }
    }
    return node;
  }

  private updateComponentNode<T>(node: ComponentNode<T>, props: T, context: ProgramContext) {
    const { component, hookState } = node;
    const elementOutput = component(props, hookState);
    node.setProps(props);
    hookState.onRenderFinish();

    const childNode = this.updateOrReplaceNode(node.childNode, elementOutput, context);
    if (node.childNode !== childNode) {
      node.setChildNode(childNode);
    }
    return node;
  }

  private updatePrimativeNode(node: PrimativeNode, primative: Primative, context: ProgramContext) {
    node.setPrimative(primative);
    const nextProgramContext = primative.type === 'set-program'
        ? this.programContextFactory(primative.props.program)
        : context;

    const childElements = primative.props.children || [];
    const maxChildUpdateIndex = Math.min(node.childNodes.length - childElements.length);

    for (let i = 0; i < maxChildUpdateIndex; i++) {
      node.childNodes[i] = this.updateOrReplaceNode(
          node.childNodes[i],
          childElements[i],
          nextProgramContext,
      );
    }

    if (node.childNodes.length < childElements.length) {
      const childrenToAdd = node.childNodes.length - childElements.length;
      for (const element of childElements.slice(childrenToAdd)) {
        node.childNodes.push(this.renderElement(element, nextProgramContext));
      }
    }
    else if (node.childNodes.length > childElements.length) {
      const newArrayLength = childElements.length - node.childNodes.length;
      node.childNodes = node.childNodes.slice(0, newArrayLength);
    }
  }
}

export function createRenderer(context: WebGLRenderingContext) {
  const { requestIdleCallback, cancelIdleCallback } = createRequestIdleCallback();

  return new Renderer(
      createProgramContextFactory(context),
      createHookStateFactory(requestIdleCallback),
      createNodeRefreshFactory(requestIdleCallback, cancelIdleCallback),
  );
}
