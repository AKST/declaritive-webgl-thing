import { createElement } from '/src/renderer/element.ts';

export function AnimateRotation({ period, uniformName, children }, env) {
  const [angle, setAngle] = env.useState(0);

  env.useEffect(() => {
    const start = performance.now();

    let frame = requestAnimationFrame(function f(delta) {
      const percent = (delta - start) / period;
      setAngle(Math.PI * 2 * percent);
      frame = requestAnimationFrame(f);
    });

    return () => cancelAnimationFrame(frame);
  }, [period, setAngle]);

  return createElement('component', Rotation, {
    uniformName,
    children,
    angle,
  });
}

export function Rotation({ angle, children, uniformName }, env) {
  return createElement('p:set-uniform', {
    uniform: env.useUniform(uniformName, '2f'),
    value: [angle, 0],
    children,
  });
}
