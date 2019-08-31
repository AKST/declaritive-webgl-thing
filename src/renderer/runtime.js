import {
  PrimativeFiber,
  ComponentFiber,
  ComponentSchedule,
} from '/src/renderer/fiber.js';
import { ProgramContext } from '/src/renderer/program_context.js';
import { createHookStateFactory } from '/src/renderer/hook_state.js';

class Render {
  constructor(context, programContextFactory, hookStateFactory) {
    this._context = context;
    this._rootFibers = undefined;
    this._programContextFactory = programContextFactory;
    this._hookStateFactory = hookStateFactory;

    // Bound methods because class members aren't supported by parcel turns out.
    this._repaint = this._repaint.bind(this);
  }

  renderPrimative(primative, parentProgramContext) {
    switch (primative.type) {
      case 'fragment': {
        const childFibers = primative.children.map(uiNode => (
            this.renderUiNode(uiNode, parentProgramContext)
        ));
        return new PrimativeFiber(parentProgramContext, primative, childFibers);
      }

      case 'set-program': {
        this._context.useProgram(primative.program);
        const programContext = this._programContextFactory(primative.program);
        const childFibers = primative.children.map(uiNode => this.renderUiNode(uiNode, programContext));
        return new PrimativeFiber(programContext, primative, childFibers);
        this._context.useProgram(primative.program);
      }

      case 'set-attribute-data': {
        const { location, size } = primative.attribute;
        const buffer = primative.buffer;
        this._context.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, buffer.buffer);
        this._context.bufferData(WebGLRenderingContext.ARRAY_BUFFER, buffer.data, buffer.kind);
        this._context.vertexAttribPointer(location, size, WebGLRenderingContext.FLOAT, false, 0, 0);
        this._context.enableVertexAttribArray(location);
        this._context.drawArrays(primative.drawKind, 0, buffer.data.length / size);
        return new PrimativeFiber(parentProgramContext, primative, undefined);
      }

      default:
        throw new Error(`unsuppported primative: ${primative.type}`);
    }
  }

  renderUiNode(uiNode, programContext) {
    switch (uiNode.type) {
      case 'primative':
        return this.renderPrimative(uiNode.primative, programContext);

      case 'component':
        const componentSchedule = new ComponentSchedule(this._repaint);
        const hookState = this._hookStateFactory(programContext, componentSchedule);
        const uiNodeOutput = uiNode.component(uiNode.props, hookState);
        const childFiber = this.renderUiNode(uiNodeOutput, programContext);
        return new ComponentFiber(hookState, uiNode.component, uiNode.props, childFiber);

      default:
        throw new Error(`unsuppported ui node: ${uiNode.type}`);
    }
  }

  renderRoot(uiNodes) {
    this._rootFibers = uiNodes.map(uiNode => this.renderUiNode(uiNode, undefined));
  }

  _repaint() {
    console.log('repaint');
  }
}

export function renderRoot(patch, context) {
  const programContextFactory = (program) => new ProgramContext(context, program);
  const requestIdleCallback = window.requestIdleCallback || setTimeout;
  const renderer = new Render(
      context,
      programContextFactory,
      createHookStateFactory(requestIdleCallback),
  );
  renderer.renderRoot(patch);
}
