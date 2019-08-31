import { createElement } from '/src/renderer/core';

function squarePoints(x, y, w, h) {
  return [
    x, y,
    x + w, y,
    x, y + h,

    x, y + h,
    x + w, y,
    x + w, y + h,
  ];
}

export class Main {
  constructor() {
    this.data = new Float32Array(squarePoints(-0.5, -0.5, 1, 1));
  }

  get bufferAttribute() {
    return {
      name: 'position',
      size: 2,
    };
  }

  render(env) {
    return createElement('p:set-attribute-data', {
      attribute: this.bufferAttribute,
      data: this.data,
      drawKind: WebGLRenderingContext.TRIANGLES,
      bufferKind: WebGLRenderingContext.STATIC_DRAW,
    });
  }
}
