import { Component, Element, Primative, Props } from '/src/renderer/base';
import { ContextTreeNode } from '/src/renderer/context/context';
import { ComponentElement, PrimativeElement } from '/src/renderer/element/element';
import { HookState } from '/src/renderer/hook_state/hook_state';

export type Node = PrimativeNode | ComponentNode<any>;

export interface NodeApi {
  shouldRerender(element: Element): boolean;
  shouldUpdate(element: Element): boolean;
  dispose(): void;
}

export function isComponentNode(element: Node): element is ComponentNode<any> {
  return element instanceof ComponentNode;
}

export function isPrimativeNode(element: Node): element is PrimativeNode {
  return element instanceof PrimativeNode;
}

export class PrimativeNode implements NodeApi {
  constructor(
      public primative: Primative,
      public childNodes: Node[] = [],
  ) {
  }

  setPrimative(primate: Primative) {
    this.primative = primate;
  }

  shouldRerender(element: Element): boolean {
    if (!(element instanceof PrimativeElement)) return true;
    return element.primative.type !== this.primative.type;
  }

  shouldUpdate(element: Element): boolean {
    return !element.primativeIsEqual(this.primative);
  }

  dispose() {
    for (const child of this.childNodes) {
      child.dispose();
    }
  }
}

export class ComponentNode<T extends Props> implements NodeApi  {
  constructor(
      public contextNode: ContextTreeNode | undefined,
      public hookState: HookState,
      public component: Component<T>,
      public props: T,
      public childNode: Node,
  ) {
  }

  setProps(props: T) {
    this.props = props;
  }

  setChildNode(childNode: Node) {
    this.childNode = childNode;
  }

  shouldRerender(element: Element): boolean {
    return !(element instanceof ComponentElement);
  }

  shouldUpdate(element: Element): boolean {
    return !element.propsAreEqual(this.props);
  }

  matchesProps(otherProps: any): boolean {
    if (typeof otherProps !== 'object') return false;
    const ownKeys = Object.keys(this.props);
    const otherKeys = Object.keys(otherProps);

    if (ownKeys.length != otherKeys.length) return false;

    for (const key of ownKeys) {
      const otherValue = (otherProps as T)[key];
      if (otherValue !== this.props[key]) return false;
    }

    return true;
  }

  dispose() {
    this.hookState.dispose();
    this.childNode.dispose();
  }
}
