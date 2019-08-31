function dependenciesDidChange(left, right) {
  if (left.length !== right.length) {
    throw new Error('dependency array length has changed');
  }
  return left.some((v, i) => v !== right[i]);
}

class MemoValue {
  constructor(value, dependencies) {
    this.value = value;
    this.dependencies = dependencies;
  }

  updateIfChange(createValue, dependencies) {
    if (dependenciesDidChange(this.dependencies, dependencies)) {
      this.value = createValue();
      this.dependencies = dependencies;
    }
  }

  static create(createValue, dependencies) {
    return new MemoValue(createValue(), dependencies);
  }
}

class StateNode {
  constructor(initialValue, queueRender) {
    this.value = initialValue;
    this.queueRender = queueRender;
    this.setValue = this.setValue.bind(this);
  }

  setValue(value) {
    this.value = value;
    this.queueRender();
  }
}

class EffectNode {
  constructor(queueEffect, dependencies) {
    this.queueEffect = queueEffect;
    this.dependencies = dependencies;
    this.tidyUp = undefined;
  }

  syncEffect(runEffect, dependencies) {
    if (dependenciesDidChange(this.dependencies, dependencies)) {
      this.queueEffect(() => {
        if (this.tidyUp) this.tidyUp();
        this.tidyUp = runEffect();
      });
      this.dependencies = dependencies;
    }
  }

  static create(queueEffect, runEffect, dependencies) {
    const instance = new EffectNode(queueEffect, dependencies);
    queueEffect(() => instance.tidyUp = runEffect());
    return instance;
  }
}

export class HookState {
  constructor(
      programContext,
      componentSchedule,
      effectNodeFactory,
      layoutEffectNodeFactory,
  ) {
    this._programContext = programContext;
    this._initialRender = true;
    this._hooks = [];
    this._hookPosition = 0;
    this._componentSchedule = componentSchedule;
    this._effectNodeFactory = effectNodeFactory;
    this._layoutEffectNodeFactory = layoutEffectNodeFactory;
  }

  useAttribute(name, size, program) {
    return this.useMemo(() => {
      const location = this._programContext.getAttributeLocation(name);
      return { location, size };
    }, [name, size]);
  }

  useUniform(name, type) {
    return this.useMemo(() => {
      const location = this._programContext.getUniformLocation(name);
      return { location, type };
    }, [name, type]);
  }

  useBuffer(data, kind) {
    return this.useMemo(() => {
      const buffer = this._programContext.createBuffer()
      return { buffer, kind, data };
    }, [data, kind]);
  }

  useEffect(runEffect, dependencies) {
    if (this._initialRender) {
      const effectNode = this._effectNodeFactory(runEffect, dependencies);
      this._hooks.push(effectNode);
    } else {
      const effectNode = this._getNextHook();
      effectNode.syncEffect(runEffect, dependencies);
    }
  }

  useLayoutEffect(runEffect, dependencies) {
    if (this._initialRender) {
      const effectNode = this._layoutEffectNodeFactory(runEffect, dependencies);
      this._hooks.push(effectNode);
    } else {
      const effectNode = this._getNextHook();
      effectNode.syncEffect(runEffect, dependencies);
    }
  }

  useState(value) {
    if (this._initialRender) {
      const scheduleRender = () => this._componentSchedule.scheduleRender();
      const stateNode = new StateNode(value, scheduleRender);

      this._hooks.push(stateNode);
      return [stateNode.value, stateNode.setValue];
    } else {
      const stateNode = this._getNextHook();
      return [stateNode.value, stateNode.setValue];
    }
  }

  useMemo(createValue, dependencies) {
    if (this._initialRender) {
      const memoValue = MemoValue.create(createValue, dependencies);
      this._hooks.push(memoValue);
      return memoValue.value;
    } else {
      const memoValue = this._getNextHook();
      memoValue.updateIfChange(createValue, dependencies);
      return memoValue.value;
    }
  }

  onRenderFinish() {
    this.hookPosition = 0;
  }

  _getNextHook() {
    return this._hooks[this._hookPosition++];
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
