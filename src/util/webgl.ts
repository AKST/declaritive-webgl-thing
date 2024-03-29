export function createShader(context: WebGLRenderingContext, shaderSource: string, type: number): WebGLShader {
  const shader = context.createShader(type);
  if (shader == null) throw new Error('shader exists');

  context.shaderSource(shader, shaderSource);
  context.compileShader(shader);
  if (context.getShaderParameter(shader, WebGLRenderingContext.COMPILE_STATUS)) {
    return shader;
  }

  const reason = context.getShaderInfoLog(shader);
  throw new Error(`failed to create shader: ${reason}`);
}

export function createProgram(
    context: WebGLRenderingContext,
    vertexSource: string,
    fragmentSource: string,
): WebGLProgram {
  const program = context.createProgram();
  if (program == null) throw new Error('program exists');

  context.attachShader(program, createShader(context, vertexSource, context.VERTEX_SHADER));
  context.attachShader(program, createShader(context, fragmentSource, context.FRAGMENT_SHADER));
  context.linkProgram(program);

  if (context.getProgramParameter(program, WebGLRenderingContext.LINK_STATUS)) {
    return program;
  }
  throw new Error('failed to create program');
}
