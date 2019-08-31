import {
  PrimativeFiber,
  ProgramContext,
  ComponentFiber,
} from '/src/renderer/fiber.js';

class Render {
  constructor(context, programContextFactory) {
    this.context = context;
    this.rootElement = undefined;
    this.programContextFactory = programContextFactory;
  }

  renderPrimative(primative, parentProgramContext) {
    switch (primative.type) {
      case 'set-program':
        this.context.useProgram(primative.program);
        const programContext = this.programContextFactory(primative.program);
        const childFibers = primative.children.map(uiNode => this.renderUiNode(uiNode, programContext));
        return new PrimativeFiber(programContext, primative, childFibers);

      case 'set-attribute-data':
        const buffer = this.context.createBuffer();
        this.context.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, buffer);
        this.context.bufferData(WebGLRenderingContext.ARRAY_BUFFER, primative.data, primative.bufferKind);

        const { program, name, size } = primative.attribute;
        const aLoc = this.context.getAttribLocation(parentProgramContext.program, name);
        this.context.vertexAttribPointer(aLoc, size, WebGLRenderingContext.FLOAT, false, 0, 0);
        this.context.enableVertexAttribArray(aLoc);
        this.context.drawArrays(primative.drawKind, 0, primative.data.length / size);
        return new PrimativeFiber(programContext, primative, undefined);

      default:
        throw new Error(`unsuppported primative: ${primative.type}`);
    }
  }

  renderUiNode(uiNode, programContext) {
    switch (uiNode.type) {
      case 'primative':
        return this.renderPrimative(uiNode.primative, programContext);

      case 'component':
        const uiNodeOutput = uiNode.component.render(undefined);
        const childFiber = this.renderUiNode(uiNodeOutput, programContext);
        return new ComponentFiber(programContext, uiNode.component, childFiber);

      default:
        throw new Error(`unsuppported ui node: ${uiNode.type}`);
    }
  }

  renderRoot(uiNodes) {
    this.rootFibers = uiNodes.map(uiNode => this.renderUiNode(uiNode, undefined));
  }
}

export function renderRoot(patch, context) {
  const programContextFactory = (program) => new ProgramContext(context, program);
  const renderer = new Render(context, programContextFactory);
  renderer.renderRoot(patch);
}
