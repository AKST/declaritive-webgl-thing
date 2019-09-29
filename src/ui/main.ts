import {
  Children,
  createElement,
  Environment,
  useAttribute,
  useBuffer,
} from '/src/renderer/index';
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

  const data = env.useMemo(() => {
    const points = squarePoints(xOffset, yOffset, size, size);
    return new Float32Array(points)
  }, [xOffset, yOffset, size]);

  return createElement('set-attribute-data', {
    attribute: useAttribute(env, attributeName, 2),
    buffer: useBuffer(env, data, WebGLRenderingContext.STATIC_DRAW),
    drawKind: WebGLRenderingContext.TRIANGLES,
  });
};

type MainProps = {
  positionAttributeName: string;
  rotationUniformName: string;
  translateUniformName: string;
};

export function Main(props: MainProps) {
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
        d: 0.2,
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
