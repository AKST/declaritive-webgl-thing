import { Primative } from '/src/renderer/element';
import { Component } from '/src/renderer/element';
import { ProgramContext } from '/src/renderer/program_context';
import { HookState } from '/src/renderer/hook_state';

export type Node = PrimativeNode | ComponentNode<unknown>;

export class PrimativeNode {
  constructor(
      public programContext: ProgramContext,
      public primative: Primative,
      public childNodes?: Node[],
  ) {
  }
}

export class ComponentNode<T> {
  constructor(
      public programContext: ProgramContext,
      public hookState: HookState,
      public component: Component<T>,
      public props: T,
      public childNode: Node,
  ) {
  }

  setChildNode(childNode: Node) {
    this.childNode = childNode;
  }

  shouldUpdate(nextNode: ComponentNode<unknown>): boolean {
    // TODO
    return false;
  }
}
