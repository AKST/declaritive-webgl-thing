import {
  PrimativeFiber,
  ComponentFiber,
  ComponentSchedule,
} from '/src/renderer/fiber.js';
import { ProgramContext } from '/src/renderer/program_context.js';
import { createHookStateFactory } from '/src/renderer/hook_state.js';

class Render {
  constructor(context, programContextFactory, hookStateFactory) {
    this.context = context;
    this.rootElement = undefined;
    this.programContextFactory = programContextFactory;
    this.repaint = this.repaint.bind(this);
    this._hookStateFactory = hookStateFactory;
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
        this.context.useProgram(primative.program);
        const programContext = this.programContextFactory(primative.program);
        const childFibers = primative.children.map(uiNode => this.renderUiNode(uiNode, programContext));
        return new PrimativeFiber(programContext, primative, childFibers);
        this.context.useProgram(primative.program);
      }

      case 'set-attribute-data': {
        const buffer = this.context.createBuffer();
        this.context.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, buffer);
        this.context.bufferData(WebGLRenderingContext.ARRAY_BUFFER, primative.data, primative.bufferKind);

        const { location, size } = primative.attribute;
        this.context.vertexAttribPointer(location, size, WebGLRenderingContext.FLOAT, false, 0, 0);
        this.context.enableVertexAttribArray(location);
        this.context.drawArrays(primative.drawKind, 0, primative.data.length / size);
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
        const componentSchedule = new ComponentSchedule(this.repaint);
        const hookState = this._hookStateFactory(programContext, componentSchedule);
        const uiNodeOutput = uiNode.component(uiNode.props, hookState);
        const childFiber = this.renderUiNode(uiNodeOutput, programContext);
        return new ComponentFiber(hookState, uiNode.component, uiNode.props, childFiber);

      default:
        throw new Error(`unsuppported ui node: ${uiNode.type}`);
    }
  }

  repaint() {
    console.log('repaint');
  }

  renderRoot(uiNodes) {
    this.rootFibers = uiNodes.map(uiNode => this.renderUiNode(uiNode, undefined));
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
