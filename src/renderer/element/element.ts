import {
  AttributeLocation,
  BufferInfo,
  Environment,
  UniformLocation,
  Props,
} from '/src/renderer/base';

function propsAreEqual(a: Props, b: Props): boolean {
  function toEqual(a: any, b: any) {
    if (a == null && b == null) return false;
    if (a == null || b == null) return false;
    if (typeof a.toEqual === 'function') {
      return a.toEqual(a, b);
    }
    return a === b;
  }

  for (const k of Object.keys({ ...a, ...b })) {
    if (!toEqual(a[k], b[k])) return false;
  }

  return true;
}

export type Component<T> = (props: T, environment: Environment) => Element;

export type Element =
    | PrimativeElement
    | ComponentElement<any>;

export type Children = readonly Element[];

export interface ElementApi {
  primativeIsEqual(other: Primative): boolean;
  propsAreEqual<U extends Props>(_other: U): boolean;
}

export function isComponentElement(element: Element): element is ComponentElement<any> {
  return element instanceof ComponentElement;
}

export function isPrimativeElement(element: Element): element is PrimativeElement {
  return element instanceof PrimativeElement;
}

export class PrimativeElement implements ElementApi {
  constructor(
      public primative: Primative,
  ) {
  }

  propsAreEqual<U extends Props>(_other: U): boolean {
    return false;
  }

  primativeIsEqual(other: Primative): boolean {
    return this.primative.type === other.type
        && propsAreEqual(this.primative.props, other.props);
  }
}

export class ComponentElement<T extends Props> implements ElementApi {
  constructor(
      public component: Component<T>,
      public props: T,
  ) {
  }

  propsAreEqual<U extends Props>(otherProps: U): boolean {
    return propsAreEqual(this.props, otherProps);
  }

  primativeIsEqual(_primative: Primative) {
    return false;
  }
}

type PrimativeKind = 'fragment' | 'set-program' | 'set-uniform' | 'set-attribute-data';

type PrimativePropMap = {
  'fragment': {
    children?: Children;
  };
  'set-program': {
    program: WebGLProgram;
    children?: Children;
  };
  'set-attribute-data': {
    attribute: AttributeLocation;
    buffer: BufferInfo;
    drawKind: number;
    children?: Children;
  };
  'set-uniform': {
    uniform: UniformLocation;
    value: number[];
    children?: Children;
  };
};

type AbstractPrimative<T extends PrimativeKind> = { type: T, props: PrimativePropMap[T] };

export type Primative =
  | AbstractPrimative<'fragment'>
  | AbstractPrimative<'set-attribute-data'>
  | AbstractPrimative<'set-program'>
  | AbstractPrimative<'set-uniform'>;

export function createElement<T, K extends PrimativeKind>(element: Component<T>, props: T): Element;
export function createElement<T, K extends PrimativeKind>(element: K, props: PrimativePropMap[K]): Element;
export function createElement<T, K extends PrimativeKind>(element: Component<T> | K, props: T | PrimativePropMap[K]): Element {
  switch (typeof element) {
    case 'string': {
      return UiNode.primative({ type: element, props } as Primative);
    }

    case 'function': {
      return UiNode.component(element, props as T);
    }

    default:
      throw new Error(`element kind not supported, ${element}`);
  }
}

export const UiNode = {
  component<T>(component: Component<T>, props: T): ComponentElement<T> {
    return new ComponentElement(component, props);
  },

  primative(primative: Primative): PrimativeElement {
    return new PrimativeElement(primative);
  }
};
