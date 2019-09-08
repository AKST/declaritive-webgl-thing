import { Element } from '/src/renderer/element/element';
import { Node } from '/src/renderer/state_tree/state_tree';
import { Painter } from '/src/renderer/runtime/painter';
import { createRenderer } from '/src/renderer/runtime/renderer';
import { createRuntime } from '/src/renderer/runtime/runtime';

export function render(
    elements: Element[],
    context: WebGLRenderingContext,
    onComplete: (node: Node[]) => void,
) {
  const runtime = createRuntime(new Painter(context), createRenderer(context));
  onComplete(runtime.renderRoot(elements));
}
