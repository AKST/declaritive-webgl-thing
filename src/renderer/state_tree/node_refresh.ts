import { ComponentNode } from './state_tree';

export class NodeRefresh<T> {
  private componentNode: ComponentNode<T> | undefined;
  private nextUpdate: number | undefined;

  constructor(
      private updateNodeInternal: (node: ComponentNode<T>) => void,
      private requestIdleCallback: (cb: () => void) => number,
      private cancelIdleCallback: (id?: number) => void,
  ) {
  }

  setNode(componentNode: ComponentNode<T>): void {
    this.componentNode = componentNode;
  }

  updateNode = () => {
    if (this.componentNode == null) {
      throw new Error('tried updating node before it existed');
    }

    const { componentNode } = this;
    this.cancelIdleCallback(this.nextUpdate);
    this.nextUpdate = this.requestIdleCallback(() => this.updateNodeInternal(componentNode));
  };
}

export type NodeRefreshFactory = <T>(updateNode: (node: ComponentNode<T>) => void) => NodeRefresh<T>;

export function createNodeRefreshFactory(
    requestIdleCallback: (callback: () => void) => number,
    cancelIdleCallback: (value?: number) => void,
): NodeRefreshFactory {
  return updateNode => new NodeRefresh(
      updateNode,
      requestIdleCallback,
      cancelIdleCallback,
  );
}
