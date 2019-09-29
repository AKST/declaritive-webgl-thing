import {
  Children,
  Element,
  Environment,
  RunAnimationFrame,
} from '/src/renderer/base';
import { createElement } from '/src/renderer/element/element';
import {
  AttributeMemoMapContext,
  ProgramContext,
  OnAnimationFrame,
  UniformMemoMapContext,
  WebGLRenderingContextContext,
} from '/src/renderer/core/core_contexts';
import {
  useAttribute,
  useAnimationFrame,
  useAnimationFrameFactory,
  useBuffer,
  useUniform,
} from '/src/renderer/core/core_hooks';
import { Node } from '/src/renderer/state_tree/state_tree';
import { Painter } from '/src/renderer/runtime/painter';
import { createRenderer } from '/src/renderer/runtime/renderer';
import { Runtime } from '/src/renderer/runtime/runtime';

export function render(
    elements: Element[],
    context: WebGLRenderingContext,
    onComplete: (node: Node[]) => void,
) {
  const animationFrameCallbacks = new Set<RunAnimationFrame>();
  const runtime = new Runtime(
      animationFrameCallbacks,
      new Painter(context),
      createRenderer()
  );

  onComplete(
      runtime.renderRoot([
        createElement(UniformMemoMapContext.Provider, {
          value: new Map(),
          children: [
            createElement(OnAnimationFrame.Provider, {
              value: animationFrameCallbacks,
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
  useAnimationFrame,
  useAnimationFrameFactory,
  useBuffer,
  useUniform,
  WebGLRenderingContextContext,
}
