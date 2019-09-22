import {
  MemoNode,
  StateNode,
} from '../hook_state';

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
