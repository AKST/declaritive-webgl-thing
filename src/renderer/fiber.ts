import { ProgramContext } from '/src/renderer/program_context';

interface IFiber {
  childFibers: readonly Fiber[];
}

export type Fiber = PrimativeFiber | ComponentFiber;

export class PrimativeFiber implements IFiber {
  constructor(
      public programContext: ProgramContext,
      public primative: any,
      public childFibers: Fiber[],
  ) {
  }
}

export class ComponentSchedule {
  private componentFiber: ComponentFiber | undefined;
  private nextUpdate: number | undefined;

  constructor(
      private updateFiberInternal: (fiber: ComponentFiber) => void,
      private requestIdleCallback: (cb: () => void) => number,
      private cancelIdleCallback: (id: number) => void,
  ) {
  }

  setFiber(componentFiber: ComponentFiber): void {
    this.componentFiber = componentFiber;
  }

  updateFiber = () => {
    if (this.componentFiber) {
      this.cancelIdleCallback(this.nextUpdate);
      this.nextUpdate = this.requestIdleCallback(() => this.updateFiberInternal(this.componentFiber));
    } else {
      throw new Error('tried updating fiber before it existed');
    }
  };
}

export class ComponentFiber implements IFiber {
  constructor(
      public programContext: ProgramContext,
      public hookState: any,
      public component: any,
      public props: any,
      public childFiber: ComponentFiber | PrimativeFiber,
  ) {
  }

  setChildFiber(childFiber) {
    this.childFiber = childFiber;
  }

  get childFibers() {
    return [this.childFiber];
  }

  shouldUpdate(nextFiber: ComponentFiber): boolean {
    // TODO
    return false;
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
