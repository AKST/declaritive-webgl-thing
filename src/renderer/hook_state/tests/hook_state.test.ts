import {
  MemoValue,
} from '../hook_state';

describe('MemoValue', () => {
  it('updateIfChange', () => {
    const memo = new MemoValue(2, [1, 2]);
    memo.updateIfChange(() => 3, [2, 2]);
    expect(memo.value).toEqual(3);
  });
});
