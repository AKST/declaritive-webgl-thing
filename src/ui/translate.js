import { createElement } from '/src/renderer/core.js';

const createOffsetValue = (distance) => (Math.random() - 0.5) * distance;

export function JitterTranslate({ uniformName, x = 0, y = 0, d, children }, env) {
  const [xOffset, setXOffset] = env.useState(createOffsetValue(d));
  const [yOffset, setYOffset] = env.useState(createOffsetValue(d));

  // env.useEffect(() => {
  //   const interval = setInterval(() => {
  //     setXOffset(createOffsetValue(d));
  //     setYOffset(createOffsetValue(d));
  //   }, 50);
  // }, []);

  return createElement('component', Translate, {
    uniformName,
    x: x + xOffset,
    y: y + yOffset,
    children,
  });
}

export function Translate({ uniformName, x, y, children }, env) {
  return createElement('p:set-uniform', {
    uniform: env.useUniform(uniformName, '2f'),
    value: [x, y],
    children,
  });
}
