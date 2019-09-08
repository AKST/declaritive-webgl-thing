export type Props = Record<string, any>;

export type RunEffect = () => (() => void) | undefined;

export type Dependencies = any[]

export type BufferInfo = { buffer: WebGLBuffer, data: Float32Array, kind: number };

export type AttributeLocation = { location: number, size: number };

export type UniformLocation = { location: WebGLUniformLocation, type: string };

export interface Environment {
  useBuffer(array: Float32Array, drawKind: number): any;
  useAttribute(name: string, size: number): AttributeLocation;
  useUniform(name: string, size: string): UniformLocation;
  useState<T>(value: T): [T, (value: T) => void];
  useMemo<T>(createValue: () => T, dependencies: Dependencies): T;
  useEffect(runEffect: RunEffect, dependencies: Dependencies): void;
  useLayoutEffect(runEffect: RunEffect, dependencies: Dependencies): void;
}

