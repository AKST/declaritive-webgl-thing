function renderPrimative(primative, context) {
  switch (primative.type) {
    case 'set-program':
      context.useProgram(primative.program);
      primative.children.forEach(uiNode => renderUiNode(uiNode, context));
      break;
    case 'set-buffer-data':
      console.log(primative);

      const buffer = context.createBuffer();
      context.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, buffer);
      context.bufferData(WebGLRenderingContext.ARRAY_BUFFER, primative.data, primative.bufferKind);

      const { program, name, size } = primative.attribute;
      const attributeLocation = context.getAttribLocation(program, name);
      context.vertexAttribPointer(attributeLocation, size, context.FLOAT, false, 0, 0);
      context.enableVertexAttribArray(attributeLocation);

      context.drawArrays(primative.drawKind, 0, primative.data.length / size);
      break;
    default:
      throw new Error(`unsuppported primative: ${primative.type}`);
  }
}

function renderUiNode(uiNode, context) {
  switch (uiNode.type) {
    case 'primative':
      renderPrimative(uiNode.primative, context);
      break;
    case 'component':
      const uiNodeOutput = uiNode.component.render(undefined);
      renderUiNode(uiNodeOutput, context);
      break;
    default:
      throw new Error(`unsuppported ui node: ${uiNode.type}`);
  }
}

function applyPatch(uiNode, state, context) {
  if (state === undefined) {
    renderUiNode(uiNode, context);
    return uiNode;
  } else {
    return state;
  }
}

export function renderRoot(patch, context) {
  const renderedElements = patch.map(
      subPatch => applyPatch(subPatch, undefined, context),
  );
}
