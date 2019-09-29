import {
  Children,
  createElement,
  Environment,
  useUniform,
  useAnimationFrameFactory,
} from '/src/renderer/index';

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

  useAnimationFrameFactory(env, () => {
    let localXOffset = xOffset;
    let localYOffset = yOffset;
    let lastUpdate = 0;

    return (delta: number) => {
      if ((delta - lastUpdate) < rate) return;

      localXOffset = (createOffsetValue(d) * 0.1) + (0.9 * localXOffset);
      localYOffset = (createOffsetValue(d) * 0.1) + (0.9 * localYOffset);
      lastUpdate = delta;

      setXOffset(localXOffset);
      setYOffset(localYOffset);
    };
  }, [rate]);

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
    uniform: useUniform(env, uniformName, '2f'),
    value: [x, y],
    children,
  });
}
