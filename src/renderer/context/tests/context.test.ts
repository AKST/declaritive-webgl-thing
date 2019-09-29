import { ContextTreeNode } from '../context';

describe('ContextTreeNode', () => {
  describe('getValue', () => {
    it('returns the value', () => {
      const node = new ContextTreeNode(undefined, 1, 2);
      expect(node.getValue()).toEqual(2);
    });
  });

  describe('setValue', () => {
    it('returns the value', () => {
      const node = new ContextTreeNode(undefined, 1, 2);
      node.setValue(3);
      expect(node.getValue()).toEqual(3);
    });
  });

  describe('getContextOf', () => {
    it('returns its self when given it\'s own key', () => {
      const node = new ContextTreeNode(undefined, 1, 'a');
      expect(node.getContextOf(1)).toEqual(node);
    });

    it('returns the parent it matches the parent key', () => {
      const parent = new ContextTreeNode(undefined, 1, 'a');
      const child = new ContextTreeNode(parent, 2, 'b');
      expect(child.getContextOf(1)).toEqual(parent);
    });
  });

  describe('subscribe', () => {
    it('updates are recieved on subscribe', () => {
      const onContextChange = jest.fn();
      const node = new ContextTreeNode(undefined, 1, 'a');
      node.subscribe(onContextChange);
      node.setValue('b');
      expect(onContextChange).toBeCalled();
    });

    it('updates are no longer recieved after unsubscribing', () => {
      const onContextChange = jest.fn();
      const node = new ContextTreeNode(undefined, 1, 'a');
      const unsubscribe = node.subscribe(onContextChange);
      unsubscribe();
      node.setValue('b');
      expect(onContextChange).not.toBeCalled();
    });
  });
});
