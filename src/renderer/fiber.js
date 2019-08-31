export class ProgramContext {
  constructor(context, program) {
    this.program = program;
    this.memoAttributeInfo = new Map();
  }

  getAttribute(name, size) {
    let attributeInfo = this.memoAttributeInfo.get(name);

    if (attributeInfo) {
      const attributeLocation = context.getAttribLocation(this.program, name);
      attributeInfo = { location: attributeLocation, size };
      this.memodLocations.set(name, attributeInfo);
    }

    return attributeInfo;
  }
}

export class PrimativeFiber {
  constructor(programContext, primative, childFibers) {
    this.programContext = programContext;
    this.childFibers = childFibers;
    this.primative = primative;
  }
}

export class ComponentFiber {
  constructor(programContext, component, childFiber) {
    this.programContext = programContext;
    this.childFiber = childFiber;
    this.component = component;
  }

  get childFibers () {
    return [this.childFiber];
  }
}
