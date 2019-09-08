import { checkExists } from '/src/util/types';
import { Fiber } from '/src/renderer/fiber';
import { renderRoot } from '/src/renderer/runtime';
import { createElement } from '/src/renderer/element';
import { createProgram } from '/src/util/webgl/create';
import { Main } from '/src/ui/main.ts';

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
    vec2 rotatedPosition = vec2(
       a_position.x * u_rotation.y + a_position.y * u_rotation.x,
       a_position.y * u_rotation.y - a_position.x * u_rotation.x);

    gl_Position = vec4(rotatedPosition + u_translate, 0.0, 1.0);
    v_color = (gl_Position) + 0.5;
  }
`;

document.addEventListener('DOMContentLoaded', function () {
  const canvasBoundsElement = checkExists(document.getElementById('bounds'), 'unable to find bounds');
  const canvasBounds = canvasBoundsElement.getBoundingClientRect();
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  canvas.width = canvasBounds.width;
  canvas.height = canvasBounds.height;

  const context = checkExists(canvas.getContext('webgl'), 'expected the context to exist');
  const program = createProgram(context, vertexSource, fragmentSource);

  renderRoot([
    createElement('set-program', {
      program,
      children: [
        createElement(Main, {
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
