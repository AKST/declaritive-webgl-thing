import {
  Context,
  Dependencies,
  Environment,
  RunEffect,
} from '/src/renderer/base';
import { ContextTreeNode } from '/src/renderer/context/context';

type QueueEffect = (callback: () => void) => void;

function dependenciesDidChange(left: Dependencies, right: Dependencies): boolean {
  if (left.length !== right.length) {
    throw new Error('dependency array length has changed');
  }
  return left.some((v, i) => v !== right[i]);
}

export class MemoNode<T> {
  constructor(public value: T, private dependencies: Dependencies) {
  }

  updateIfChange(createValue: () => T, dependencies: Dependencies) {
    if (dependenciesDidChange(this.dependencies, dependencies)) {
      this.value = createValue();
      this.dependencies = dependencies;
    }
  }

  static create<T>(createValue: () => T, dependencies: Dependencies): MemoNode<T> {
    return new MemoNode(createValue(), dependencies);
  }
}

export class StateNode<T> {
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

export class EffectNode {
  private tidyUp?: () => void;

  constructor(
      private readonly requestIdleCallback: QueueEffect,
      private dependencies: Dependencies,
  ) {
    this.tidyUp = undefined;
  }

  syncEffect(runEffect: RunEffect, dependencies: Dependencies) {
    if (dependenciesDidChange(this.dependencies, dependencies)) {
      this.requestIdleCallback(() => {
        if (this.tidyUp) this.tidyUp();
        this.tidyUp = runEffect();
      });
      this.dependencies = dependencies;
    }
  }

  static create(requestIdleCallback: QueueEffect, runEffect: RunEffect, dependencies: Dependencies) {
    const instance = new EffectNode(requestIdleCallback, dependencies);
    requestIdleCallback(() => instance.tidyUp = runEffect());
    return instance;
  }
}

export class ContextNode {
  private unsubscribe?: () => void;
  private currentContext?: Context<any>;

  constructor(
      private contextTreeNode: ContextTreeNode | undefined,
      private requestUpdate: () => void,
  ) {
  }

  getValueFor<T, B>(context: Context<T>, fallbackValue: B): T | B {
    if (this.contextTreeNode) {
      const contextNode = this.contextTreeNode.getContextOf(context.key);
      if (contextNode == null) return fallbackValue;

      if (this.currentContext !== context) {
        if (this.unsubscribe) this.unsubscribe();
        this.unsubscribe = contextNode.subscribe(this.requestUpdate)
      }

      return contextNode.getValue();
    } else {
      return fallbackValue;
    }
  }
}

type HookNode =
    | MemoNode<unknown>
    | StateNode<unknown>
    | EffectNode
    | ContextNode;

export class HookState implements Environment {
  private hooks: HookNode[] = [];
  private hookPosition: number = 0;
  private initialRender: boolean = true;

  constructor(
      private contextTreeNode: ContextTreeNode | undefined,
      private requestUpdate: () => void,
      private effectNodeFactory: (runEffect: RunEffect, dependencies: Dependencies) => EffectNode,
      private layoutEffectNodeFactory: (runEffect: RunEffect, dependencies: Dependencies) => EffectNode,
  ) {
  }

  useContext<A, B>(context: Context<A>, fallbackValue: B): A | B {
    if (this.initialRender) {
      const contextNode = new ContextNode(this.contextTreeNode, this.requestUpdate);
      this.hooks.push(contextNode);
      return contextNode.getValueFor(context, fallbackValue);
    } else {
      const contextNode = this.getNextHook();

      if (!(contextNode instanceof ContextNode)) {
        throw new Error('hook call order out of sync');
      }

      return contextNode.getValueFor(context, fallbackValue);
    }
  }

  useEffect(runEffect: RunEffect, dependencies: Dependencies) {
    if (this.initialRender) {
      const effectNode = this.effectNodeFactory(runEffect, dependencies);
      this.hooks.push(effectNode);
    } else {
      const effectNode = this.getNextHook();

      if (!(effectNode instanceof EffectNode)) {
        throw new Error('hook call order out of sync');
      }

      effectNode.syncEffect(runEffect, dependencies);
    }
  }

  useLayoutEffect(runEffect: RunEffect, dependencies: Dependencies) {
    if (this.initialRender) {
      const effectNode = this.layoutEffectNodeFactory(runEffect, dependencies);
      this.hooks.push(effectNode);
    } else {
      const effectNode = this.getNextHook();

      if (!(effectNode instanceof EffectNode)) {
        throw new Error('hook call order out of sync');
      }

      effectNode.syncEffect(runEffect, dependencies);
    }
  }

  useState<T>(value: T): [T, (value: T) => void] {
    if (this.initialRender) {
      const stateNode = new StateNode(value, this.requestUpdate);
      this.hooks.push(stateNode as StateNode<unknown>);
      return [stateNode.value, stateNode.setValue];
    } else {
      const stateNode = this.getNextHook();

      if (!(stateNode instanceof StateNode)) {
        throw new Error('hook call order out of sync');
      }

      return [stateNode.value as T, stateNode.setValue];
    }
  }

  useMemo<T>(createValue: () => T, dependencies: Dependencies): T {
    if (this.initialRender) {
      const memoValue = MemoNode.create(createValue, dependencies);
      this.hooks.push(memoValue);
      return memoValue.value;
    } else {
      const memoValue = this.getNextHook() as MemoNode<T>;

      if (!(memoValue instanceof MemoNode)) {
        throw new Error('hook order out of sync');
      }

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

export type HookStateFactory = (
    contextTreeNode: ContextTreeNode | undefined,
    scheduleUpdate: () => void,
) => HookState;

export function createHookStateFactory(
  requestIdleCallback: (cb: () => void) => number,
): HookStateFactory {
  const runImmediately = (callback: () => void) => {
    try {
      callback()
    } catch (e) {
      console.error(e);
    }
  };

  return (contextTreeNode, componentSchedule) => (
      new HookState(
          contextTreeNode,
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
