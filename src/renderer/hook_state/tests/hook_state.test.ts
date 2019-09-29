import {
  EffectNode,
  MemoNode,
  StateNode,
} from '../hook_state';

describe('EffectNode', () => {
  const runCallback = (f: () => void) => f();

  describe('create', () => {
    it('runs the runCallback', () => {
      const runCallback = jest.fn();
      const runEffect = () => undefined;
      EffectNode.create(runCallback, runEffect, []);
      expect(runCallback).toBeCalled();
    });

    it('runs the effect', () => {
      const runEffect = jest.fn();
      EffectNode.create(runCallback, runEffect, []);
      expect(runEffect).toBeCalled();
    });

    it('calls runEffect from runCallback', () => {
      const runCallback = jest.fn();
      const runEffect = jest.fn();
      EffectNode.create(runCallback, runEffect, []);
      runCallback.mock.calls[0][0]();
      expect(runEffect).toBeCalled();
    });
  });

  describe('syncEffect', () => {
    it('calls effect on change', () => {
      const runEffect = jest.fn();
      const effect = new EffectNode(runCallback, [1]);
      effect.syncEffect(runEffect, [2]);
      expect(runEffect).toBeCalled();
    });

    it('does not call effect on no change', () => {
      const runEffect = jest.fn();
      const effect = new EffectNode(runCallback, [1]);
      effect.syncEffect(runEffect, [1]);
      expect(runEffect).not.toBeCalled();
    });

    it('calls tidy up on change', () => {
      const tidyUp = jest.fn();
      const runEffect = () => undefined;
      const effect = new EffectNode(runCallback, [1], tidyUp);
      effect.syncEffect(runEffect, [2]);
      expect(tidyUp).toBeCalled();
    });
  });

  describe('dispose', () => {
    it('calls tidy up', () => {
      const tidyUp = jest.fn();
      const effect = new EffectNode(runCallback, [1], tidyUp);
      effect.dispose();
      expect(tidyUp).toBeCalled();
    });

    it('tidy up at most once', () => {
      const tidyUp = jest.fn();
      const effect = new EffectNode(runCallback, [1], tidyUp);
      effect.dispose();
      effect.dispose();
      expect(tidyUp).toHaveBeenCalledTimes(1);
    });
  });
});

describe('MemoNode', () => {
  it('updateIfChange', () => {
    const memo = new MemoNode(2, [1, 2]);
    memo.updateIfChange(() => 3, [2, 2]);
    expect(memo.value).toEqual(3);
  });

  it('create', () => {
    const memo = MemoNode.create(() => 1 + 2, [1, 2]);
    expect(memo.value).toEqual(3);
  });
});

describe('StateNode', () => {
  it('setValue', () => {
    const requestUpdate = jest.fn();
    const node = new StateNode(2, requestUpdate);
    node.setValue(3);
    expect(node.value).toEqual(3);
    expect(requestUpdate).toBeCalled();
  });
});
