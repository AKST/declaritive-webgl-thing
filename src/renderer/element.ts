import {
  AttributeLocation,
  BufferInfo,
  Environment,
  UniformLocation,
  Props,
} from '/src/renderer/base';

export function propsAreEqual(a: Props, b: Props): boolean {
  function toEqual(a: any, b: any) {
    if (a == null && b == null) return false;
    if (a == null || b == null) return false;
    if (typeof a.toEqual === 'function') {
      return a.toEqual(a, b);
    }
    return a === b;
  }

  for (const k of Object.keys(a)) {
    if (!toEqual(a[k], b[k])) return false;
  }
  return true;
}

export type Component<T> = (props: T, environment: Environment) => Element;

export type Element =
    | PrimativeElement
    | ComponentElement<any>;

export type Children = readonly Element[];

export class ComponentElement<T extends Props> {
  constructor(
      public component: Component<T>,
      public props: T,
  ) {
  }

  toEqual<U extends Props>(element: ComponentElement<U>): boolean {
    return propsAreEqual(this.props, element.props);
  }
}

export class PrimativeElement {
  constructor(
      public primative: Primative,
  ) {
  }

  toEqual(other: PrimativeElement): boolean {
    return this.primative.type === other.primative.type
        && propsAreEqual(this.primative.props, other.primative.props);
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
