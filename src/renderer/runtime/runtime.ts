import { Element, RunAnimationFrame } from '/src/renderer/base';
import { Node } from '/src/renderer/state_tree/state_tree';
import { Painter } from './painter';
import { Renderer } from './renderer';

export class Runtime {
  private rootNodes: Node[] = [];

  constructor(
      private readonly animationFrameCallbacks: Set<RunAnimationFrame>,
      private readonly painter: Painter,
      private readonly renderer: Renderer,
      private requestAnimationFrame: typeof window.requestAnimationFrame,
      private readonly startTime: number,
  ) {
  }

  renderRoot(elements: Element[]): Node[] {
    this.rootNodes = elements.map(element => this.renderer.createStateTree(element));
    this.onNewAnimationFrame(this.startTime);
    return this.rootNodes;
  }

  private onNewAnimationFrame = (d: number) => {
    this.painter.paint(this.rootNodes);

    try {
      for (const callback of this.animationFrameCallbacks) {
        callback(d, this.startTime);
      }
    } catch (e) {
      console.error(e);
    }

    this.requestAnimationFrame(this.onNewAnimationFrame);
  };
}
