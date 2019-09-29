/**
 * Note these hooks are written under the impression that
 * context will never ever change & there will only be one
 * rendering context for each applications render tree.
 *
 * Now that we've got that out of the way, to avoid an
 * unecessary dep comparision
 */
import { assertExists } from '/src/util/types';
import {
  AttributeLocation,
  BufferInfo,
  Environment,
  RunAnimationFrame,
  UniformLocation,
} from '/src/renderer/base';
import {
  AttributeMemoMapContext,
  ProgramContext,
  OnAnimationFrame,
  UniformMemoMapContext,
  WebGLRenderingContextContext,
} from './core_contexts';

export function useBuffer(environment: Environment, data: Float32Array, kind: number): BufferInfo {
  const context = environment.useContext(WebGLRenderingContextContext, undefined);

  return environment.useMemo(() => {
    const buffer = assertExists(context && context.createBuffer());
    return { buffer, data, kind };
  }, [data, kind]);
}

export function useAttribute(environment: Environment, name: string, size: number): AttributeLocation {
  const context = environment.useContext(WebGLRenderingContextContext, undefined)!;
  const program = environment.useContext(ProgramContext, undefined)!;
  const attrMap = environment.useContext(AttributeMemoMapContext, undefined)!;

  return environment.useMemo(() => {
    const programsMap = getOrSetGetKey(attrMap, program, () => new Map());
    const location =  getOrSetGetKey(programsMap, name, () => context.getAttribLocation(program, name));
    return { size, location: assertExists(location) };
  }, [name, program]);
}

export function useUniform(environment: Environment, name: string, type: string): UniformLocation {
  const context = environment.useContext(WebGLRenderingContextContext, undefined)!;
  const program = environment.useContext(ProgramContext, undefined)!;
  const uniformMap = environment.useContext(UniformMemoMapContext, undefined)!;

  return environment.useMemo(() => {
    const programsMap = getOrSetGetKey(uniformMap, program, () => new Map());
    const location = getOrSetGetKey(programsMap, name, () => context.getUniformLocation(program, name));
    return { type, location: assertExists(location) };
  }, [name, program]);
}

export function useAnimationFrame(
    environment: Environment,
    onAnimationFrame: RunAnimationFrame,
    dependencies: any[],
) {
  const animationFrameCallbacks = environment.useContext(OnAnimationFrame, undefined);

  environment.useLayoutEffect(() => {
    if (!animationFrameCallbacks) return;
    animationFrameCallbacks.add(onAnimationFrame);
    return () => animationFrameCallbacks.delete(onAnimationFrame);
  }, dependencies);
}

export function useAnimationFrameFactory(
    environment: Environment,
    onAnimationFrameFactory: () => RunAnimationFrame,
    dependencies: any[],
) {
  const onAnimationFrame = environment.useMemo(() => onAnimationFrameFactory(), dependencies);
  useAnimationFrame(environment, onAnimationFrame, [onAnimationFrame]);
}

function getOrSetGetKey<K, V>(map: Map<K, V>, key: K, initialValue: () => V): V {
  const maybeValue = map.get(key);
  if (maybeValue == null) {
    const value = initialValue();
    map.set(key, value);
    return value;
  }
  return maybeValue;
}
