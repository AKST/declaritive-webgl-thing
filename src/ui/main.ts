import { Environment } from '/src/renderer/base';
import { createElement, Children } from '/src/renderer/element';
import { Translate, JitterTranslate } from '/src/ui/translate';
import { AnimateRotation } from '/src/ui/rotate';

function squarePoints(x: number, y: number, w: number, h: number) {
  return [
    x, y,
    x + w, y,
    x, y + h,

    x, y + h,
    x + w, y,
    x + w, y + h,
  ];
}


type SquareProps = {
  xOffset: number;
  yOffset: number;
  attributeName: string;
  size: number;
};

const Square = (props: SquareProps, env: Environment) => {
  const { xOffset, yOffset, attributeName, size } = props;
  const data = env.useMemo(() => (
      new Float32Array(squarePoints(xOffset, yOffset, size, size))
  ), [xOffset, yOffset, size]);

  const buffer = env.useBuffer(data, WebGLRenderingContext.STATIC_DRAW);
  const drawKind = WebGLRenderingContext.TRIANGLES;
  const attribute = env.useAttribute(attributeName, 2);

  return createElement('set-attribute-data', { attribute, buffer, drawKind });
};

type MainProps = {
  positionAttributeName: string;
  rotationUniformName: string;
  translateUniformName: string;
};

export function Main(props: MainProps, env: Environment) {
  const {
    positionAttributeName: attributeName,
    rotationUniformName,
    translateUniformName,
  } = props;
  const createJitter = (children: Children) => (
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
