export class PrimativeFiber {
  constructor(programContext, primative, childFibers) {
    this.programContext = programContext;
    this.childFibers = childFibers;
    this.primative = primative;
  }
}

export class ComponentFiber {
  constructor(hookState, component, childFiber) {
    this.hookState = hookState;
    this.component = component;
    this.childFiber = childFiber;
  }

  get childFibers () {
    return [this.childFiber];
  }
}
