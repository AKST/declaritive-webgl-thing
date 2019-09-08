import { createRequestIdleCallback } from '/src/util/browser/request_idle_callback';
import { Element, Primative, ComponentElement } from '/src/renderer/element';
import { createHookStateFactory, HookStateFactory } from '/src/renderer/hook_state/hook_state';
import {
  createProgramContextFactory,
  ProgramContext,
  ProgramContextFactory,
} from '/src/renderer/program_context/program_context';
import { createNodeRefreshFactory, NodeRefreshFactory } from '/src/renderer/state_tree/node_refresh';
import { Node, PrimativeNode, ComponentNode } from '/src/renderer/state_tree/state_tree';

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

  private renderComponent<T>(element: ComponentElement<T>, programContext: ProgramContext): Node {
    const nodeRefresh = this.nodeRefreshFactory<T>(this.updateComponent);
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

  private updateComponent = <T>(componentNode: ComponentNode<T>) => {
    const { component, props, hookState, programContext } = componentNode;
    const elementOutput = component(props, hookState);
    hookState.onRenderFinish();

    // TODO: children update
    const childNode = this.renderElement(elementOutput, programContext);
    componentNode.setChildNode(childNode);
  };
}

export function createRenderer(context: WebGLRenderingContext) {
  const { requestIdleCallback, cancelIdleCallback } = createRequestIdleCallback();

  return new Renderer(
      createProgramContextFactory(context),
      createHookStateFactory(requestIdleCallback),
      createNodeRefreshFactory(requestIdleCallback, cancelIdleCallback),
  );
}
