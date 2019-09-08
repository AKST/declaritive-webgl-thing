import { Element } from '/src/renderer/element';
import { Node } from '/src/renderer/state_tree/state_tree';
import { Painter } from './painter';
import { Renderer, createRenderer } from './renderer';

class Runtime {
  private rootNodes: Node[] = [];

  constructor(
      private readonly painter: Painter,
      private readonly renderer: Renderer,
  ) {
  }

  renderRoot(elements: Element[]): Node[] {
    this.rootNodes = elements.map(element => this.renderer.createStateTree(element));
    this.onNewAnimationFrame();
    return this.rootNodes;
  }

  private onNewAnimationFrame = () => {
    this.painter.paint(this.rootNodes);
    requestAnimationFrame(this.onNewAnimationFrame);
  };
}

export function renderRoot(
    elements: Element[],
    context: WebGLRenderingContext,
    onComplete: (node: Node[]) => void,
) {
  const runtime = new Runtime(new Painter(context), createRenderer(context));
  onComplete(runtime.renderRoot(elements));
}
