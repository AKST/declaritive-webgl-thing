import { createRequestIdleCallback } from '/src/util/browser/request_idle_callback';
import { ContextTreeNode } from '/src/renderer/context/context';
import { Element, Primative } from '/src/renderer/base';
import {
  ComponentElement,
  PrimativeElement,
  isComponentElement,
  isPrimativeElement,
} from '/src/renderer/element/element';
import { createHookStateFactory, HookStateFactory } from '/src/renderer/hook_state/hook_state';
import { createNodeRefreshFactory, NodeRefreshFactory } from '/src/renderer/state_tree/node_refresh';
import {
  Node,
  PrimativeNode,
  ComponentNode,
  isComponentNode,
  isPrimativeNode,
} from '/src/renderer/state_tree/state_tree';

export class Renderer {
  constructor(
      private readonly hookStateFactory: HookStateFactory,
      private readonly nodeRefreshFactory: NodeRefreshFactory,
  ) {
  }

  createStateTree(element: Element): Node {
    return this.renderElement(element, undefined);
  }

  updateComponentEntryPoint = <T>(componentNode: ComponentNode<T>) => {
    this.updateComponentNode(
        componentNode,
        componentNode.props,
        componentNode.contextNode,
    );
  };

  private renderElement(element: Element, contextNode?: ContextTreeNode): Node {
    if (element instanceof PrimativeElement) {
      return this.renderPrimative(element.primative, contextNode);
    }
    else if (element instanceof ComponentElement) {
      return this.renderComponent(element, contextNode);
    }
    throw new Error(`unsuppported ui node: ${element}`);
  }

  private renderComponent<T>(
      element: ComponentElement<T>,
      contextNode: ContextTreeNode | undefined,
  ): Node {
    const nodeRefresh = this.nodeRefreshFactory<T>(this.updateComponentEntryPoint);
    const hookState = this.hookStateFactory(contextNode, nodeRefresh.updateNode);
    const elementOutput = element.component(element.props, hookState);
    const childNode = this.renderElement(elementOutput, contextNode);
    const componentNode = new ComponentNode<T>(
        contextNode,
        hookState,
        element.component,
        element.props,
        childNode,
    );
    hookState.onRenderFinish();
    nodeRefresh.setNode(componentNode);
    return componentNode;
  }

  private renderPrimative(primative: Primative, parentContextTreeNode?: ContextTreeNode): Node {
    const createChildNodes = (contextNode: ContextTreeNode | undefined): Node[] | undefined => {
      if (primative.props.children) {
        return primative.props.children.map((element: Element) => (
            this.renderElement(element, contextNode)
        ));
      }
      return undefined;
    };

    switch (primative.type) {
      case 'set-context': {
        const { key, value } = primative.props;
        const contextNode = new ContextTreeNode(parentContextTreeNode, key,  value);
        const childNodes = createChildNodes(contextNode);
        return new PrimativeNode(primative, childNodes);
      }

      default: {
        const childNodes = createChildNodes(parentContextTreeNode);
        return new PrimativeNode(primative, childNodes);
      }
    }
  }

  private updateOrReplaceNode(
      node: Node,
      output: Element,
      contextNode: ContextTreeNode | undefined,
  ): Node {
    if (node.shouldRerender(output)) {
      node.dispose();
      return this.renderElement(output, contextNode);
    }
    if (node.shouldUpdate(output)) {
      if (isComponentNode(node) && isComponentElement(output)) {
        this.updateComponentNode(node, output.props, contextNode);
      } else if (isPrimativeNode(node) && isPrimativeElement(output)) {
        this.updatePrimativeNode(node, output.primative, contextNode);
      } else {
        // this should have been picked up in the first guard conditional.
        throw new Error('should not occur');
      }
    }
    return node;
  }

  private updateComponentNode<T>(
      node: ComponentNode<T>,
      props: T,
      contextNode: ContextTreeNode | undefined,
  ) {
    const { component, hookState } = node;
    const elementOutput = component(props, hookState);
    node.setProps(props);
    hookState.onRenderFinish();

    const childNode = this.updateOrReplaceNode(
        node.childNode,
        elementOutput,
        contextNode,
    );

    if (node.childNode !== childNode) {
      node.childNode.dispose();
      node.setChildNode(childNode);
    }

    return node;
  }

  private updatePrimativeNode(
      node: PrimativeNode,
      primative: Primative,
      contextNode: ContextTreeNode | undefined,
  ) {
    node.setPrimative(primative);
    // const nextContext = primative.type === 'set-program'
    //     ? this.programContextFactory(primative.props.program)
    //     : programContext;

    const childElements = primative.props.children || [];
    const maxChildUpdateIndex = Math.min(node.childNodes.length - childElements.length);

    for (let i = 0; i < maxChildUpdateIndex; i++) {
      node.childNodes[i] = this.updateOrReplaceNode(
          node.childNodes[i],
          childElements[i],
          contextNode,
      );
    }

    if (node.childNodes.length < childElements.length) {
      const childrenToAdd = node.childNodes.length - childElements.length;
      for (const element of childElements.slice(childrenToAdd)) {
        const newElement = this.renderElement(element, contextNode);
        node.childNodes.push(newElement);
      }
    }
    else if (node.childNodes.length > childElements.length) {
      const newArrayLength = childElements.length - node.childNodes.length;

      // clean up dismounted children.
      for (const child of node.childNodes.slice(newArrayLength)) {
        child.dispose();
      }

      node.childNodes = node.childNodes.slice(0, newArrayLength);
    }
  }
}

export function createRenderer() {
  const { requestIdleCallback, cancelIdleCallback } = createRequestIdleCallback();

  return new Renderer(
      createHookStateFactory(requestIdleCallback),
      createNodeRefreshFactory(requestIdleCallback, cancelIdleCallback),
  );
}
