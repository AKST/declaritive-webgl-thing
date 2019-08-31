export class ProgramContext {
  constructor(context, program) {
    this.context = context;
    this.program = program;
    this.memoAttributeLocation = new Map();
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
