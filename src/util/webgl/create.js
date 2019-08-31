export function createShader(context, shaderSource, type) {
  const shader = context.createShader(type);
  context.shaderSource(shader, shaderSource);
  context.compileShader(shader);
  if (context.getShaderParameter(shader, WebGLRenderingContext.COMPILE_STATUS)) {
    return shader;
  }
  const reason = context.getShaderInfoLog(shader);
  throw new Error(`failed to create shader: ${reason}`);
}

export function createProgram(context, vertexSource, fragmentSource) {
  const program = context.createProgram();
  context.attachShader(program, createShader(context, vertexSource, context.VERTEX_SHADER));
  context.attachShader(program, createShader(context, fragmentSource, context.FRAGMENT_SHADER));
  context.linkProgram(program);
  if (context.getProgramParameter(program, WebGLRenderingContext.LINK_STATUS)) {
    return program;
  }
  throw new Error('failed to create program');
}
