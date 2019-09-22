export type Props = Record<string, any>;

export type RunEffect = () => (() => void) | undefined;

export type Dependencies = any[]

export type BufferInfo = { buffer: WebGLBuffer, data: Float32Array, kind: number };

// TODO, rename to AttributeInfo
export type AttributeLocation = { location: number, size: number };

// TODO, rename to UniformInfo
export type UniformLocation = { location: WebGLUniformLocation, type: string };

export type Component<T> = (props: T, environment: Environment) => Element;

export type Element =
    | PrimativeElementApi
    | ComponentElementApi<any>;

export type Children = readonly Element[];

export interface ElementApi {
  primativeIsEqual(other: Primative): boolean;
  propsAreEqual<U extends Props>(_other: U): boolean;
}

export interface PrimativeElementApi extends ElementApi {
  primative: Primative;
}

export interface ComponentElementApi<T extends Props> extends ElementApi {
  props: T;
}

export type PrimativeKind =
  | 'fragment'
  | 'set-program'
  | 'set-uniform'
  | 'set-context'
  | 'set-attribute-data';

export type PrimativePropMap = {
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
  'set-context': {
    key: number;
    value: any;
    children: Children;
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
  | AbstractPrimative<'set-context'>
  | AbstractPrimative<'set-uniform'>;

export type Context<T> = {
  key: number,
  Provider: Component<{ children: readonly Element[], value: T }>;
};


// TODO
// - label useEffect as asyncronous effect
// - label useLayoutEffect as syncronous effect
export interface Environment {
  useContext<A, B>(context: Context<A>, fallbackValue: B): A | B;
  useState<T>(value: T): [T, (value: T) => void];
  useMemo<T>(createValue: () => T, dependencies: Dependencies): T;
  useEffect(runEffect: RunEffect, dependencies: Dependencies): void;
  useLayoutEffect(runEffect: RunEffect, dependencies: Dependencies): void;
}
