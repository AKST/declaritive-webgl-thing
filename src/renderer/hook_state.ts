import { Dependencies, Environment, RunEffect } from '/src/renderer/element';
import { ProgramContext } from '/src/renderer/program_context';

type QueueEffect = (callback: () => void) => void;

function dependenciesDidChange(left: Dependencies, right: Dependencies): boolean {
  if (left.length !== right.length) {
    throw new Error('dependency array length has changed');
  }
  return left.some((v, i) => v !== right[i]);
}

class MemoValue<T> {
  constructor(public value: T, private dependencies: Dependencies) {
  }

  updateIfChange(createValue: () => T, dependencies: Dependencies) {
    if (dependenciesDidChange(this.dependencies, dependencies)) {
      this.value = createValue();
      this.dependencies = dependencies;
    }
  }

  static create<T>(createValue: () => T, dependencies: Dependencies): MemoValue<T> {
    return new MemoValue(createValue(), dependencies);
  }
}

class StateNode<T> {
  constructor(
      public value: T,
      private readonly requestUpdate: () => void,
  ) {
  }

  setValue = (value: T): void => {
    this.value = value;
    try {
      this.requestUpdate();
    } catch (e) {
      console.error('set value failed', e);
    }
  }
}


class EffectNode {
  private tidyUp?: () => void;

  constructor(
      private readonly queueEffect: QueueEffect,
      private dependencies: Dependencies,
  ) {
    this.tidyUp = undefined;
  }

  syncEffect(runEffect: RunEffect, dependencies: Dependencies) {
    if (dependenciesDidChange(this.dependencies, dependencies)) {
      this.queueEffect(() => {
        if (this.tidyUp) this.tidyUp();
        this.tidyUp = runEffect();
      });
      this.dependencies = dependencies;
    }
  }

  static create(queueEffect: QueueEffect, runEffect: RunEffect, dependencies: Dependencies) {
    const instance = new EffectNode(queueEffect, dependencies);
    queueEffect(() => instance.tidyUp = runEffect());
    return instance;
  }
}

export class HookState implements Environment {
  private hooks = [];
  private hookPosition: number = 0;
  private initialRender: boolean = true;

  constructor(
      private programContext: ProgramContext,
      private requestUpdate: () => void,
      private effectNodeFactory: (runEffect: RunEffect, dependencies: Dependencies) => EffectNode,
      private layoutEffectNodeFactory: (runEffect: RunEffect, dependencies: Dependencies) => EffectNode,
  ) {
  }

  useAttribute(name, size, program) {
    return this.useMemo(() => {
      const location = this.programContext.getAttributeLocation(name);
      return { location, size };
    }, [name, size]);
  }

  useUniform(name, type) {
    return this.useMemo(() => {
      const location = this.programContext.getUniformLocation(name);
      return { location, type };
    }, [name, type]);
  }

  useBuffer(data, kind) {
    return this.useMemo(() => {
      const buffer = this.programContext.createBuffer()
      return { buffer, kind, data };
    }, [data, kind]);
  }

  useEffect(runEffect: RunEffect, dependencies: Dependencies) {
    if (this.initialRender) {
      const effectNode = this.effectNodeFactory(runEffect, dependencies);
      this.hooks.push(effectNode);
    } else {
      const effectNode = this.getNextHook();
      effectNode.syncEffect(runEffect, dependencies);
    }
  }

  useLayoutEffect(runEffect: RunEffect, dependencies: Dependencies) {
    if (this.initialRender) {
      const effectNode = this.layoutEffectNodeFactory(runEffect, dependencies);
      this.hooks.push(effectNode);
    } else {
      const effectNode = this.getNextHook();
      effectNode.syncEffect(runEffect, dependencies);
    }
  }

  useState<T>(value: T): [T, (value: T) => void] {
    if (this.initialRender) {
      const stateNode = new StateNode(value, this.requestUpdate);
      this.hooks.push(stateNode);
      return [stateNode.value, stateNode.setValue];
    } else {
      const stateNode = this.getNextHook();
      return [stateNode.value, stateNode.setValue];
    }
  }

  useMemo<T>(createValue: () => T, dependencies: Dependencies): T {
    if (this.initialRender) {
      const memoValue = MemoValue.create(createValue, dependencies);
      this.hooks.push(memoValue);
      return memoValue.value;
    } else {
      const memoValue = this.getNextHook();
      memoValue.updateIfChange(createValue, dependencies);
      return memoValue.value;
    }
  }

  onRenderFinish() {
    this.initialRender = false;
    this.hookPosition = 0;
  }

  private getNextHook() {
    return this.hooks[this.hookPosition++];
  }
}

export function createHookStateFactory(
  requestIdleCallback,
) {
  const runImmediately = (callback) => {
    try {
      callback()
    } catch (e) {
      console.error(e);
    }
  };

  return (programContext, componentSchedule) => (
      new HookState(
          programContext,
          componentSchedule,
          (runEffect, dependencies) => (
              EffectNode.create(
                  requestIdleCallback,
                  runEffect,
                  dependencies,
              )
          ),
          (runEffect, dependencies) => (
              EffectNode.create(
                  runImmediately,
                  runEffect,
                  dependencies,
              )
          ),
      )
  );
}
