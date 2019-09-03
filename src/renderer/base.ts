export type RunEffect = () => (() => void) | undefined;

export type Dependencies = any[]

export type AttributeLocation = { location: number, size: number };

export type UniformLocation = { location: WebGLUniformLocation, type: string };

export interface Environment {
  useAttribute(name: string, size: number, program: any): AttributeLocation;
  useUniform(name: string, size: number, program: any): UniformLocation;
  useState<T>(value: T): [T, (value: T) => void];
  useMemo<T>(createValue: () => T, dependencies: Dependencies): T;
  useEffect(runEffect: RunEffect, dependencies: Dependencies): void;
  useLayoutEffect(runEffect: RunEffect, dependencies: Dependencies): void;
}

