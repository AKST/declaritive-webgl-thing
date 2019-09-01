import { renderRoot } from '/src/renderer/runtime';
import { createElement } from '/src/renderer/element.ts';
import { createProgram } from '/src/util/webgl/create';

import { Main } from '/src/ui/main';

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
  const canvasBounds = document.getElementById('bounds').getBoundingClientRect();
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  canvas.width = canvasBounds.width;
  canvas.height = canvasBounds.height;

  const context = canvas.getContext('webgl');
  const program = createProgram(context, vertexSource, fragmentSource);

  renderRoot([
    createElement('p:set-program', {
      program,
      children: [
        createElement('component', Main, {
          positionAttributeName: 'a_position',
          translateUniformName: 'u_translate',
        })
      ],
    }),
  ], context, function (fiber) {
    console.log(fiber);
  });
});
