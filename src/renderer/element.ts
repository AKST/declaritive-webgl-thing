import {
  AttributeLocation,
  BufferInfo,
  Environment,
  UniformLocation,
} from '/src/renderer/base';

export type Component<T> = (props: T, environment: Environment) => Element;

export type Element =
    | PrimativeElement
    | ComponentElement<any>;

export type Children = readonly Element[];

export type ComponentElement<T> = {
  type: 'component';
  component: Component<T>;
  props: T;
};

export type PrimativeElement = {
  type: 'primative',
  primative: Primative;
};

type PrimativeKind = 'fragment' | 'set-program' | 'set-uniform' | 'set-attribute-data';

type PrimativePropMap = {
  'fragment': { children?: Children };
  'set-attribute-data': { attribute: AttributeLocation, buffer: BufferInfo, drawKind: number, children?: Children };
  'set-program': { program: WebGLProgram, children?: Children };
  'set-uniform': { uniform: UniformLocation, value: number[], children?: Children };
};

type AbstractPrimative<T extends PrimativeKind> = { type: T, props: PrimativePropMap[T] };

export type Primative =
  | AbstractPrimative<'fragment'>
  | AbstractPrimative<'set-attribute-data'>
  | AbstractPrimative<'set-program'>
  | AbstractPrimative<'set-uniform'>;

type CreateElement =
  | (<T>(element: Component<T>, props: T) => Element)
  | (<K extends PrimativeKind>(element: K, props: PrimativePropMap[K]) => Element);

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
    return { type: 'component', component, props };
  },

  primative(primative: Primative): PrimativeElement {
    return { type: 'primative', primative };
  }
};
