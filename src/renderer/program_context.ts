import { checkExists } from '/src/util/types';

export class ProgramContext {
  memoAttributeLocation = new Map();
  memoUniformLocation = new Map();

  constructor(
      private context: WebGlRenderingContext,
      private program: WebGlProgram,
  ) {
  }

  createBuffer() {
    return this.context.createBuffer();
  }

  getUniformLocation(name: string) {
    const location = this.memoUniformLocation.get(name);

    if (!location) {
      const location = this.context.getUniformLocation(this.program, name);
      this.memoUniformLocation.set(name, location);
      return checkExists(location, 'failed to create Uniform Location');
    }

    return location;
  }

  getAttributeLocation(name: string): number {
    const location = this.memoAttributeLocation.get(name);

    if (!location) {
      const location = this.context.getAttribLocation(this.program, name);
      this.memoAttributeLocation.set(name, location);
      return checkExists(location, 'failed to create Attribute Location');
    }

    return location;
  }
}
