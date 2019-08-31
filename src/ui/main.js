import { createElement } from '/src/renderer/core';
import { Translate, JitterTranslate } from '/src/ui/translate';

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

export function Main({
  positionAttributeName: attributeName,
  translateUniformName: uniformName,
}, env) {
  env.useEffect(() => {
    console.log('effect!');
  }, []);

  return createElement('p:fragment', [
    createElement('component', Translate, {
      x: 0,
      y: 0,
      uniformName,
      children: [
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
      ],
    }),
    createElement('component', JitterTranslate, {
      x: 0,
      y: 0,
      d: 0.25,
      uniformName,
      children: [
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
      ]
    }),
  ]);
}
