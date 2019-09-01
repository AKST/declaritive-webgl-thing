import { renderRoot } from '/src/renderer/runtime';
import { createElement } from '/src/renderer/element.ts';
import { createProgram } from '/src/util/webgl/create';

import { Main } from '/src/ui/main';

const fragmentSource = `
  precision mediump float;
  varying vec4 v_color;

  void main() {
    gl_FragColor = v_color;
  }
`;

const vertexSource = `
  precision mediump float;

  attribute vec2 a_position;
  uniform vec2 u_translate;
  uniform vec2 u_rotation;
  varying vec4 v_color;

  void main() {
    u_rotation;
    gl_Position = vec4(a_position + u_translate, 0.0, 1.0);
    v_color = (gl_Position * 0.5) + 0.5;
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
          rotationUniformName: 'u_rotation',
        })
      ],
    }),
  ], context, function onComplete(fiber) {
    console.log(fiber);
  });
});
