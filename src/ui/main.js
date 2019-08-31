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

const Square = ({ xOffset, yOffset, attributeName, size }, env) => {
  const data = env.useMemo(() => (
      new Float32Array(squarePoints(xOffset, yOffset, size, size))
  ), [xOffset, yOffset, size]);

  const buffer = env.useBuffer(data, WebGLRenderingContext.STATIC_DRAW);
  const drawKind = WebGLRenderingContext.TRIANGLES;
  const attribute = env.useAttribute(attributeName, 2);

  return createElement('p:set-attribute-data', { attribute, buffer, drawKind });
};

export function Main({ attributeName }, env) {
  env.useEffect(() => {
    console.log('effect!');
  }, []);

  return createElement('p:fragment', [
    createElement('component', Square, {
      attributeName,
      xOffset: -0.5,
      yOffset: -0.5,
      size: 0.5,
    }),
    createElement('component', Square, {
      attributeName,
      xOffset: 0,
      yOffset: 0,
      size: 0.5,
    }),
    createElement('component', Square, {
      attributeName,
      xOffset: -0.5 + (0.5 * 0.25),
      yOffset: 0.5 * 0.25,
      size: 0.25,
    }),
    createElement('component', Square, {
      attributeName,
      xOffset: 0.5  * 0.25,
      yOffset: -0.5 + (0.5 * 0.25),
      size: 0.25,
    }),
  ]);
}
