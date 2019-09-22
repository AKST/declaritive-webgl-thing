import { Children, Element } from '/src/renderer/base';
import { createContext } from '/src/renderer/context/context';
import { createElement } from '/src/renderer/element/element';

export type UniformMemoMap = Map<WebGLProgram, Map<string, WebGLUniformLocation>>;
export type AttributeMemoMap = Map<WebGLProgram, Map<string, number>>;

export const ProgramContext = createContext<WebGLProgram>();
export const WebGLRenderingContextContext = createContext<WebGLRenderingContext>();
export const UniformMemoMapContext = createContext<UniformMemoMap>();
export const AttributeMemoMapContext = createContext<AttributeMemoMap>();
