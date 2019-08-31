export class HookState {
  constructor(programContext) {
    this.programContext = programContext;
    this.initialRender = true;
    this.hooks = [];
  }

  useAttribute(name, size) {
    let location = this.programContext.getAttributeLocation(name);
    return ({ location, size });
  }

  useMemo(createValue, dependencies) {
  }
}
