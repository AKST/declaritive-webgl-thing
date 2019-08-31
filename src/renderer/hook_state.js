export class HookState {
  constructor(programContext) {
    this.programContext = programContext;
    this.initialRender = true;
    this.hooks = [];
  }

  useAttribute(name, size) {
    let location = this.programContext.getAttributeLocation(name);
    console.log(this.programContext);
    console.log(name, size, location);
    return { location, size };
  }
}
