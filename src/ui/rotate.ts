import {
  Children,
  createElement,
  Environment,
  useUniform,
} from '/src/renderer/index';

type AnimateRotationProps = {
  period: number;
  children: Children;
  uniformName: string;
};

export function AnimateRotation(props: AnimateRotationProps, env: Environment) {
  const { period, uniformName, children } = props;
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

  return createElement(Rotation, {
    uniformName,
    children,
    angle,
  });
}

type RotationProps = {
  angle: number;
  children: Children;
  uniformName: string;
};

export function Rotation(props: RotationProps, env: Environment) {
  const { angle, children, uniformName } = props;
  const radians = angle * Math.PI / 180;
  return createElement('set-uniform', {
    uniform: useUniform(env, uniformName, '2f'),
    value: [Math.sin(radians), Math.cos(radians)],
    children,
  });
}
