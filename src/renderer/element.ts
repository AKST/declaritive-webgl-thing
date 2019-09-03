import { Environment } from '/src/renderer/base';

export type Component<T> = (props: T, environment: Environment) => Element;

export type Element =
    | PrimativeElement
    | ComponentElement<any>;

export type ComponentElement<T> = {
  type: 'component';
  component: Component<T>;
  props: T;
};

export type PrimativeElement = {
  type: 'primative',
  primative: Primative;
};

export type Primative =
  | FragmentPrimative
  | SetAttributeDataPrimative
  | SetUniformPrimative
  | SetProgramPrimative;

type Children = readonly Element[];

export type SetProgramPrimative =
    Readonly<{ type: 'set-program', program: WebGLProgram, children?: Children }>;

export type SetUniformPrimative =
    Readonly<{ type: 'set-uniform', uniform: any, value: any, children?: Children }>;

export type SetAttributeDataPrimative =
    Readonly<{ type: 'set-attribute-data', attribute: any, buffer: any, drawKind: any }>;

export type FragmentPrimative =
    Readonly<{ type: 'fragment', children?: Children }>;

export function createElement<T>(element: string, props: any): Element;
export function createElement<T>(element: Component<T>, props: T): Element;
export function createElement<T>(element: Component<T> | string, props: any | T): Element {
  switch (typeof element) {
    case 'string': {
      const [primativeProps] = props;
      return UiNode.primative(Primative.createPrimative(element, primativeProps));
    }

    case 'function': {
      const [component, componentProps] = props;
      return UiNode.component(component, componentProps);
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

export const Primative = {
  fragment(children?: Children): FragmentPrimative {
    return { type: 'fragment', children };
  },

  setAttributeData(attribute: any, buffer: any, drawKind: any): SetAttributeDataPrimative {
    return { type: 'set-attribute-data', attribute, buffer, drawKind };
  },

  setUniform(uniform: any, value: any, children?: Children): SetUniformPrimative {
    return { type: 'set-uniform', uniform, value, children };
  },

  setProgram(program: WebGLProgram, children?: Children): SetProgramPrimative {
    return { type: 'set-program', program, children };
  },

  createPrimative(kind: string, props: any): Primative {
    switch (kind) {
      case 'set-attribute-data':
        return Primative.setAttributeData(
            props.attribute,
            props.buffer,
            props.drawKind,
        );

      case 'set-program':
        return Primative.setProgram(props.program, props.children);

      case 'set-uniform':
        return Primative.setUniform(props.uniform, props.value, props.children);

      case 'fragment':
        return Primative.fragment(props);

      default:
        throw new Error(`unknown primative, ${kind}`);
    }
  },
};
