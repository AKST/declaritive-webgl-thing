import { Element, createElement } from '/src/renderer/element/element';
import {
  ComponentNode,
  PrimativeNode,
} from '/src/renderer/state_tree/state_tree';
import {
  createRenderer,
  createRendererForRenderCycle,
} from './renderer_mock';

describe('Renderer', () => {
  describe('createStateTree', () => {
    it('rendering a primative element', () => {
      const { runtime } = createRenderer();
      const primativeProps = {} as any;
      const element = createElement('set-attribute-data', primativeProps);

      const output = runtime.createStateTree(element);

      expect(output).toEqual(
          new PrimativeNode(
              { type: 'set-attribute-data', props: primativeProps },
              undefined,
          ),
      )
    });

    it('rendering a component element with a child component', () => {
      const { runtime, ...mocks } = createRendererForRenderCycle();

      const Component = jest.fn();
      const ChildComponent = jest.fn();
      Component.mockReturnValue(createElement(ChildComponent, { name: 'child', a: 2 }));
      ChildComponent.mockReturnValue(createElement('fragment', { children: [] }));

      const output = runtime.createStateTree(createElement(Component, { a: 1 }));
      const childNode = new ComponentNode(
          mocks.programContext,
          mocks.hookState,
          ChildComponent,
          { name: 'child', a: 2 },
          new PrimativeNode(
              { type: 'fragment', props: { children: [] } },
              [],
          ),
      );
      const topLevelNode = new ComponentNode(
          mocks.programContext,
          mocks.hookState,
          Component,
          { a: 1 },
          childNode,
      );

      expect(mocks.nodeRefresh.setNode).toHaveBeenNthCalledWith(1, childNode);
      expect(mocks.nodeRefresh.setNode).toHaveBeenNthCalledWith(2, topLevelNode);
      expect(mocks.programContextFactory).toBeCalled();
      expect(mocks.hookStateFactory).toBeCalled();

      expect(output).toEqual(topLevelNode);
    });
  });

  describe('updateComponent', () => {
    it('updating a component with a child component', () => {
      const { runtime, ...mocks } = createRendererForRenderCycle();

      const Parent = jest.fn();
      const Child = jest.fn();

      const topLevelNode = new ComponentNode(
          mocks.programContext,
          mocks.hookState,
          Parent,
          { a: 1 },
          new ComponentNode(
              mocks.programContext,
              mocks.hookState,
              Child,
              { name: 'child', a: 2 },
              new PrimativeNode(
                  { type: 'fragment', props: { children: [] } },
                  [],
              ),
          ),
      );

      // Note that:
      // - the parent updates a child components 'a' attribute
      // - the child should return the same result.
      Parent.mockReturnValue(createElement(Child, { name: 'child', a: 3 }));
      Child.mockReturnValue(createElement('fragment', { children: [] }));

      runtime.updateComponentEntryPoint(topLevelNode);

      expect(mocks.programContextFactory).not.toBeCalled();
      expect(mocks.hookStateFactory).not.toBeCalled();
      expect(mocks.nodeRefresh.setNode).not.toBeCalled();

      expect(topLevelNode).toEqual(
          new ComponentNode(
              mocks.programContext,
              mocks.hookState,
              Parent,
              { a: 1 },
              new ComponentNode(
                  mocks.programContext,
                  mocks.hookState,
                  Child,
                  { name: 'child', a: 3 },
                  new PrimativeNode(
                      { type: 'fragment', props: { children: [] } },
                      [],
                  ),
              ),
          ),
      );
    });

    it('updating a component with a child primative', () => {
      const { runtime, ...mocks } = createRendererForRenderCycle();

      const Parent = jest.fn();

      const topLevelNode = new ComponentNode(
          mocks.programContext,
          mocks.hookState,
          Parent,
          { a: 1 },
          new PrimativeNode(
              { type: 'fragment', props: {} },
              [],
          ),
      );

      Parent.mockReturnValue(createElement('fragment', { children: [] }));

      runtime.updateComponentEntryPoint(topLevelNode);

      expect(mocks.programContextFactory).not.toBeCalled();
      expect(mocks.hookStateFactory).not.toBeCalled();
      expect(mocks.nodeRefresh.setNode).not.toBeCalled();

      expect(topLevelNode).toEqual(
          new ComponentNode(
              mocks.programContext,
              mocks.hookState,
              Parent,
              { a: 1 },
              new PrimativeNode(
                  { type: 'fragment', props: { children: [] } },
                  [],
              ),
          ),
      );
    });
  });
});
