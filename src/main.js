import { Main } from '/src/ui/main.js';
import { renderRoot } from '/src/renderer/runtime.js';
import { createElement } from '/src/renderer/core.js';
import { createProgram } from '/src/util/webgl/create.js';

const fragmentSource = `
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
`;

const vertexSource = `
  attribute vec2 a_position;

  uniform vec2 u_translate;

  void main() {
    gl_Position = vec4(a_position + u_translate, 0.0, 1.0);
  }
`;

document.addEventListener('DOMContentLoaded', function () {
  const { width, height } = document.getElementById('bounds').getBoundingClientRect();
  const canva = document.getElementById('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('webgl');
  const program = createProgram(context, vertexSource, fragmentSource);

  function Translate({ x, y, children }, env) {
    const [xOffset, setXOffset] = env.useState(0);
    const [yOffset, setYOffset] = env.useState(0);

    env.useEffect(() => {
      const interval = setInterval(() => {
        setXOffset((Math.random() - 0.5) * 0.1);
        setYOffset((Math.random() - 0.5) * 0.1);
      }, 50);
    }, []);

    return createElement('p:set-uniform', {
      uniform: env.useUniform('u_translate', '2f'),
      value: [x, y],
      children,
    });
  }

  renderRoot([
    createElement('p:set-program', {
      program,
      children: [
        createElement('component', Translate, {
          x: 0,
          y: -0.25,
          children: [
            createElement('component', Main, {
              attributeName: 'a_position',
            }),
          ],
        }),
      ],
    }),
  ], context, function (fiber) {
    console.log(fiber);
  });
});
