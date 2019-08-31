export class PrimativeFiber {
  constructor(programContext, primative, childFibers) {
    this.programContext = programContext;
    this.childFibers = childFibers;
    this.primative = primative;
  }
}

export class ComponentSchedule {
  constructor(updateFiber) {
    this.componentFiber = undefined;
    this._updateFiber = updateFiber;
  }

  setFiber(componentFiber) {
    this.componentFiber = componentFiber;
  }

  updateFiber() {
    if (this.componentFiber) {
      this._updateFiber(this.componentFiber);
    } else {
      throw new Error('tried updating fiber before it existed');
    }
  }
}

export class ComponentFiber {
  constructor(programContext, hookState, component, props, childFiber) {
    this.programContext = programContext;
    this.hookState = hookState;
    this.component = component;
    this.props = props;
    this.childFiber = childFiber;
  }

  setChildFiber(childFiber) {
    this.childFiber = childFiber;
  }

  get childFibers () {
    return [this.childFiber];
  }
}
