class Render {
  constructor(context) {
    this.context = context;
  }

  renderPrimative(primative) {
    switch (primative.type) {
      case 'set-program':
        this.context.useProgram(primative.program);
        primative.children.forEach(uiNode => this.renderUiNode(uiNode));
        break;
      case 'set-buffer-data':
        const buffer = this.context.createBuffer();
        this.context.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, buffer);
        this.context.bufferData(WebGLRenderingContext.ARRAY_BUFFER, primative.data, primative.bufferKind);

        const { program, name, size } = primative.attribute;
        const aLoc = this.context.getAttribLocation(program, name);
        this.context.vertexAttribPointer(aLoc, size, WebGLRenderingContext.FLOAT, false, 0, 0);
        this.context.enableVertexAttribArray(aLoc);
        this.context.drawArrays(primative.drawKind, 0, primative.data.length / size);
        break;
      default:
        throw new Error(`unsuppported primative: ${primative.type}`);
    }
  }

  renderUiNode(uiNode) {
    switch (uiNode.type) {
      case 'primative':
        this.renderPrimative(uiNode.primative);
        break;
      case 'component':
        const uiNodeOutput = uiNode.component.render(undefined);
        this.renderUiNode(uiNodeOutput);
        break;
      default:
        throw new Error(`unsuppported ui node: ${uiNode.type}`);
    }
  }

  applyPatch(uiNode, state) {
    if (state === undefined) {
      this.renderUiNode(uiNode);
      return uiNode;
    } else {
      return state;
    }
  }
}

export function renderRoot(patch, context) {
  const renderer = new Render(context);
  patch.map(subPatch => renderer.applyPatch(subPatch, undefined));
}
