export class ProgramContext {
  constructor(context, program) {
    this.context = context;
    this.program = program;
    this.memoAttributeLocation = new Map();
    this.memoUniformLocation = new Map();
  }

  createBuffer() {
    return this.context.createBuffer();
  }

  getUniformLocation(name) {
    const location = this.memoUniformLocation.get(name);

    if (!location) {
      const location = this.context.getUniformLocation(this.program, name);
      this.memoUniformLocation.set(name, location);
      return location;
    }

    return location;
  }

  getAttributeLocation(name) {
    const location = this.memoAttributeLocation.get(name);

    if (!location) {
      const location = this.context.getAttribLocation(this.program, name);
      this.memoAttributeLocation.set(name, location);
      return location;
    }

    return location;
  }
}
