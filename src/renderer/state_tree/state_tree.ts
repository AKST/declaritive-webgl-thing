import { Props } from '/src/renderer/base';
import { Primative, Component } from '/src/renderer/element/element';
import { ProgramContext } from '/src/renderer/program_context/program_context';
import { HookState } from '/src/renderer/hook_state/hook_state';

export type Node = PrimativeNode | ComponentNode<any>;

export class PrimativeNode {
  constructor(
      public primative: Primative,
      public childNodes?: Node[],
  ) {
  }
}

export class ComponentNode<T extends Props> {
  constructor(
      public programContext: ProgramContext,
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
}
