import { Element } from '/src/renderer/element';
import { ComponentNode, PrimativeNode } from './state_tree';

export class Reconciler {
  constructor(private updateComponent: any) {
  }

  reconcileComponent(componentNode: ComponentNode<any>, output: Element) {

  }

  reconcilePrimative(componentNode: PrimativeNode, output: Element) {

  }
}
