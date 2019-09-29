import {
  Children,
  createElement,
  Environment,
  useAnimationFrame,
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

  useAnimationFrame(env, (delta: number, start: number) => {
    const percent = (delta - start) / period;
    setAngle(360 * percent);
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
