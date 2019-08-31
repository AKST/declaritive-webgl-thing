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

export function createMain() {
  const data = new Float32Array(squarePoints(-0.5, -0.5, 1, 1));

  return (props, env) => {
    const attribute = env.useAttribute(props.attribute, 2);

    return createElement('p:set-attribute-data', {
      attribute,
      data,
      drawKind: WebGLRenderingContext.TRIANGLES,
      bufferKind: WebGLRenderingContext.STATIC_DRAW,
    });
  };
}
