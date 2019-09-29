import { createMockInstance } from '/src/renderer/util/tests';
import { NodeRefresh } from '/src/renderer/state_tree/node_refresh';

export function createNodeRefreshMock() {
  return createMockInstance(NodeRefresh);
}

