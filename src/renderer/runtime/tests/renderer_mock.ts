import { Renderer } from '../renderer';
import { createHookStateMock } from '/src/renderer/hook_state/tests/hook_state_mock';
import { createProgramContextMock } from '/src/renderer/program_context/tests/program_context_mock';
import { createNodeRefreshMock } from '/src/renderer/state_tree/tests/node_refresh_mock';

export const createRenderer = () => {
  const programContextFactory = jest.fn();
  const hookStateFactory = jest.fn();
  const nodeRefreshFactory = jest.fn();
  return {
    programContextFactory,
    hookStateFactory,
    nodeRefreshFactory,
    runtime: new Renderer(
        programContextFactory,
        hookStateFactory,
        nodeRefreshFactory,
    ),
  };
};

export const createRendererForRenderCycle = () => {
  const mocks = createRenderer();

  const programContext = createProgramContextMock();
  mocks.programContextFactory.mockReturnValue(programContext);

  const hookState = createHookStateMock();
  mocks.hookStateFactory.mockReturnValue(hookState);

  const nodeRefresh = createNodeRefreshMock();
  mocks.nodeRefreshFactory.mockReturnValue(nodeRefresh);

  return {
    ...mocks,
    nodeRefresh,
    hookState,
    programContext,
  };
};
