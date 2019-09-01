export class PrimativeFiber {
  constructor(programContext, primative, childFibers) {
    this.programContext = programContext;
    this.childFibers = childFibers;
    this.primative = primative;
  }
}

export class ComponentSchedule {
  constructor(updateFiberInternal, requestIdleCallback, cancelIdleCallback) {
    this.componentFiber = undefined;
    this._updateFiberInternal = updateFiberInternal;
    this._nextUpdate = undefined;
    this._requestIdleCallback = requestIdleCallback;
    this._cancelIdleCallback = cancelIdleCallback;
    this.updateFiber = this.updateFiber.bind(this);
  }

  setFiber(componentFiber) {
    this.componentFiber = componentFiber;
  }

  updateFiber() {
    if (this.componentFiber) {
      if (this._nextUpdate) {
        this._cancelIdleCallback(this._nextUpdate);
        this._nextUpdate = undefined;
      }
      this._nextUpdate = requestIdleCallback(() => this._updateFiberInternal(this.componentFiber));
    } else {
      throw new Error('tried updating fiber before it existed');
    }
  }

  shouldUpdate(nextFiber: ComponentFiber) {

  }
}

export class ComponentFiber {
  constructor(
      programContext,
      hookState,
      component,
      props,
      childFiber,
  ) {
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

export function createComponentScheduleFactory(
    requestIdleCallback,
    cancelIdleCallback,
) {
  return updateFiber => new ComponentSchedule(
      updateFiber,
      requestIdleCallback,
      cancelIdleCallback,
  );
}
