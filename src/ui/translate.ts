import { Environment } from '/src/renderer/base';
import { createElement, Children } from '/src/renderer/element/element';

const createOffsetValue = (distance: number) => (Math.random() - 0.5) * distance;

type JitterTranslateProps = {
  rate?: number,
  uniformName: string;
  x: number;
  y: number;
  d: number;
  children: Children,
};

export function JitterTranslate(props: JitterTranslateProps, env: Environment) {
  const { rate = 1000 / 30, uniformName, x = 0, y = 0, d, children } = props;
  const [xOffset, setXOffset] = env.useState(createOffsetValue(d));
  const [yOffset, setYOffset] = env.useState(createOffsetValue(d));

  // env.useEffect(() => {
  //   const interval = setInterval(() => {
  //     setXOffset(createOffsetValue(d));
  //     setYOffset(createOffsetValue(d));
  //   }, rate);

  //   return () => clearInterval(interval);
  // }, [rate]);

  return createElement(Translate, {
    uniformName,
    x: x + xOffset,
    y: y + yOffset,
    children,
  });
}

type TranslateProps = {
  uniformName: string;
  x: number;
  y: number;
  children: Children;
};

export function Translate(props: TranslateProps, env: Environment) {
  const { uniformName, x, y, children } = props;
  return createElement('set-uniform', {
    uniform: env.useUniform(uniformName, '2f'),
    value: [x, y],
    children,
  });
}
