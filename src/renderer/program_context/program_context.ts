import { checkExists } from '/src/util/types';

export class ProgramContext {
  private readonly memoAttributeLocation = new Map();
  private readonly memoUniformLocation = new Map();

  constructor(
      private context: WebGLRenderingContext,
      private program?: WebGLProgram,
  ) {
  }

  createBuffer(): WebGLBuffer | undefined {
    return this.context.createBuffer() || undefined;
  }

  getUniformLocation(name: string): WebGLUniformLocation {
    const location = this.memoUniformLocation.get(name);

    if (this.program == null) {
      throw new Error('no specified program');
    }

    if (!location) {
      const location = this.context.getUniformLocation(this.program, name);
      this.memoUniformLocation.set(name, location);
      return checkExists(location, 'failed to create Uniform Location');
    }

    return location;
  }

  getAttributeLocation(name: string): number {
    const location = this.memoAttributeLocation.get(name);

    if (this.program == null) {
      throw new Error('no specified program');
    }

    if (!location) {
      const location = this.context.getAttribLocation(this.program, name);
      this.memoAttributeLocation.set(name, location);
      return checkExists(location, 'failed to create Attribute Location');
    }

    return location;
  }
}

export type ProgramContextFactory = (program?: WebGLProgram) => ProgramContext;

export function createProgramContextFactory(
  context: WebGLRenderingContext,
): ProgramContextFactory {
  return program => new ProgramContext(context, program);
}
