import { Element, createElement } from '/src/renderer/element/element';
import {
  ComponentNode,
  PrimativeNode,
} from '/src/renderer/state_tree/state_tree';
import {
  createRenderer,
  createRendererForRenderCycle,
} from './renderer_mock';

const createComponent = <T>(childOutput: Element) => (_props: T) => childOutput;

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

    it('rendering a component element', () => {
      const { runtime, ...mocks } = createRendererForRenderCycle();

      const childElement = createElement('fragment', { children: [] });
      const Component = createComponent<{ a: number }>(childElement);
      const props = { a: 2 };

      const element = createElement(Component, props);
      const childOutput = runtime.createStateTree(childElement);
      const output = runtime.createStateTree(element);

      expect(mocks.nodeRefresh.setNode).toBeCalledWith(output);
      expect(mocks.programContextFactory).toBeCalled();
      expect(mocks.hookStateFactory).toBeCalled();

      expect(output).toEqual(
          new ComponentNode(
              mocks.programContext,
              mocks.hookState,
              Component,
              props,
              childOutput,
          ),
      );
    });
  });
});
