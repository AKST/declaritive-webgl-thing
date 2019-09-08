import { Element, ComponentElement, PrimativeElement } from '/src/renderer/element/element';
import { Node, ComponentNode, PrimativeNode } from './state_tree';

type RenderElement = (element: Element, withElement: (element: Node) => void) => void;
type UpdateComponent = <T>(component: ComponentNode<T>, props: T) => void;

export class Reconciler {
  constructor(
      private updateComponent: UpdateComponent,
      private _renderElement: RenderElement,
  ) {
  }

  reconcile(node: Node, element: Element) {
    if (element instanceof ComponentElement && node instanceof ComponentNode) {
      this.reconcileComponent(node, element);
    }
    else if (element instanceof PrimativeElement && node instanceof PrimativeNode) {
      this.reconcilePrimative(node, element);
    }
    else {
      throw new Error('unsuppported, changing element positioning between updates');
    }
  }

  private reconcileComponent(componentNode: ComponentNode<any>, element: ComponentElement<any>) {
    if (componentNode.component !== element.component) {
      throw new Error('unsuppported, changing component positioning between updates');
    }
    if (!componentNode.matchesProps(element.props)) {
      this.updateComponent(componentNode, element.props);
    }
  }

  private reconcilePrimative(componentNode: PrimativeNode, element: PrimativeElement) {
  }
}
