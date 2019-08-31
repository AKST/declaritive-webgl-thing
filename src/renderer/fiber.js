export class PrimativeFiber {
  constructor(programContext, primative, childFibers) {
    this.programContext = programContext;
    this.childFibers = childFibers;
    this.primative = primative;
  }
}

export class ComponentSchedule {
  constructor(repaint) {
    this.componentFiber = undefined;
    this.repaint = repaint;
  }

  setFiber(componentFiber) {
    this.componentFiber = componentFiber;
  }

  scheduleRender() {
    this.repaint();
  }
}

export class ComponentFiber {
  constructor(hookState, component, props, childFiber) {
    this.hookState = hookState;
    this.component = component;
    this.props = props;
    this.childFiber = childFiber;
  }

  get childFibers () {
    return [this.childFiber];
  }
}
