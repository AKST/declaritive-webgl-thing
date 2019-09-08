import { Primative } from '/src/renderer/element';
import { Component } from '/src/renderer/element';
import { ProgramContext } from '/src/renderer/program_context';
import { HookState } from '/src/renderer/hook_state';

export type Fiber = PrimativeFiber | ComponentFiber<unknown>;

export class PrimativeFiber {
  constructor(
      public programContext: ProgramContext,
      public primative: Primative,
      public childFibers?: Fiber[],
  ) {
  }
}

export class ComponentSchedule<T> {
  private componentFiber: ComponentFiber<T> | undefined;
  private nextUpdate: number | undefined;

  constructor(
      private updateFiberInternal: (fiber: ComponentFiber<T>) => void,
      private requestIdleCallback: (cb: () => void) => number,
      private cancelIdleCallback: (id: number) => void,
  ) {
  }

  setFiber(componentFiber: ComponentFiber<T>): void {
    this.componentFiber = componentFiber;
  }

  updateFiber = () => {
    if (this.componentFiber == null) {
      throw new Error('tried updating fiber before it existed');
    }

    const { componentFiber } = this;
    if (this.nextUpdate) this.cancelIdleCallback(this.nextUpdate);
    this.nextUpdate = this.requestIdleCallback(() => this.updateFiberInternal(componentFiber));
  };
}

export class ComponentFiber<T> {
  constructor(
      public programContext: ProgramContext,
      public hookState: HookState,
      public component: Component<T>,
      public props: T,
      public childFiber: Fiber,
  ) {
  }

  setChildFiber(childFiber: Fiber) {
    this.childFiber = childFiber;
  }

  shouldUpdate(nextFiber: ComponentFiber<unknown>): boolean {
    // TODO
    return false;
  }
}

export type ComponentScheduleFactory = <T>(updateFiber: (fiber: ComponentFiber<T>) => void) => ComponentSchedule<T>;

export function createComponentScheduleFactory(
    requestIdleCallback: (callback: () => void) => number,
    cancelIdleCallback: (value: number) => void,
): ComponentScheduleFactory {
  return updateFiber => new ComponentSchedule(
      updateFiber,
      requestIdleCallback,
      cancelIdleCallback,
  );
}
