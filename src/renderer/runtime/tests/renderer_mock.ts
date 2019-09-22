import { Renderer } from '../renderer';
import { createHookStateMock } from '/src/renderer/hook_state/tests/hook_state_mock';
import { createNodeRefreshMock } from '/src/renderer/state_tree/tests/node_refresh_mock';

export const createRenderer = () => {
  const hookStateFactory = jest.fn();
  const nodeRefreshFactory = jest.fn();
  return {
    hookStateFactory,
    nodeRefreshFactory,
    runtime: new Renderer(
        hookStateFactory,
        nodeRefreshFactory,
    ),
  };
};

export const createRendererForRenderCycle = () => {
  const mocks = createRenderer();

  const hookState = createHookStateMock();
  mocks.hookStateFactory.mockReturnValue(hookState);

  const nodeRefresh = createNodeRefreshMock();
  mocks.nodeRefreshFactory.mockReturnValue(nodeRefresh);

  return {
    ...mocks,
    nodeRefresh,
    hookState,
  };
};
