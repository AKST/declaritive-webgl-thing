import { createElement } from '/src/renderer/element.ts';

export function AnimateRotation({ period, uniformName, children }, env) {
  const [angle, setAngle] = env.useState(0);

  env.useEffect(() => {
    const start = performance.now();

    let frame = requestAnimationFrame(function f(delta) {
      const percent = (delta - start) / period;
      setAngle(360 * percent);
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
  const radians = angle * Math.PI / 180;
  return createElement('p:set-uniform', {
    uniform: env.useUniform(uniformName, '2f'),
    value: [Math.sin(radians), Math.cos(radians)],
    children,
  });
}
