import { createElement } from '/src/renderer/element';
import { Translate, JitterTranslate } from '/src/ui/translate';
import { AnimateRotation } from '/src/ui/rotate';

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

  return createElement('set-attribute-data', { attribute, buffer, drawKind });
};

export function Main({
  positionAttributeName: attributeName,
  rotationUniformName,
  translateUniformName,
}, env) {

  const createJitter = (children) => (
      createElement(JitterTranslate, {
        rate: 1000 / 30,
        x: 0,
        y: 0,
        d: 0.02,
        uniformName: translateUniformName,
        children
      })
  );

  return createElement(AnimateRotation, {
    period: 10000,
    uniformName: rotationUniformName,
    children: [
      createElement(Translate, {
        x: 0,
        y: 0,
        uniformName: translateUniformName,
        children: [
          createElement(Square, {
            attributeName,
            xOffset: -0.5,
            yOffset: -0.5,
            size: 0.5,
          }),
          createElement(Square, {
            attributeName,
            xOffset: 0,
            yOffset: 0,
            size: 0.5,
          }),
        ],
      }),
      createJitter([
        createElement(Square, {
          attributeName,
          xOffset: -0.5 + (0.5 * 0.25),
          yOffset: 0.5 * 0.25,
          size: 0.25,
        })
      ]),
      createJitter([
        createElement(Square, {
          attributeName,
            xOffset: 0.5  * 0.25,
            yOffset: -0.5 + (0.5 * 0.25),
            size: 0.25,
        })
      ]),
    ],
  });
}
