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
  attribute vec2 position;

  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

document.addEventListener('DOMContentLoaded', function () {
  const canva = document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const context = canvas.getContext('webgl');
  const program = createProgram(context, vertexSource, fragmentSource);

  renderRoot([
    createElement('p:set-program', {
      program,
      children: [
        createElement('component', Main, { attributeName: 'position' }),
      ],
    }),
  ], context);
});
