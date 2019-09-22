import { Children, Element, Environment } from '/src/renderer/base';
import { createElement } from '/src/renderer/element/element';
import {
  AttributeMemoMapContext,
  ProgramContext,
  UniformMemoMapContext,
  WebGLRenderingContextContext,
} from '/src/renderer/core/core_contexts';
import {
  useAttribute,
  useBuffer,
  useUniform,
} from '/src/renderer/core/core_hooks';
import { Node } from '/src/renderer/state_tree/state_tree';
import { Painter } from '/src/renderer/runtime/painter';
import { createRenderer } from '/src/renderer/runtime/renderer';
import { createRuntime } from '/src/renderer/runtime/runtime';

export function render(
    elements: Element[],
    context: WebGLRenderingContext,
    onComplete: (node: Node[]) => void,
) {
  const runtime = createRuntime(new Painter(context), createRenderer());

  onComplete(
      runtime.renderRoot([
        createElement(UniformMemoMapContext.Provider, {
          value: new Map(),
          children: [
            createElement(AttributeMemoMapContext.Provider, {
              value: new Map(),
              children:  [
                createElement(WebGLRenderingContextContext.Provider, {
                  value: context,
                  children: elements,
                }),
              ],
            }),
          ],
        }),
      ]),
  );
}

export {
  createElement,
  Children,
  Element,
  Environment,
  ProgramContext,
  useAttribute,
  useBuffer,
  useUniform,
  WebGLRenderingContextContext,
}
