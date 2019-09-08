import { createMockInstance } from '/src/util/tests';
import { NodeRefresh } from '/src/renderer/state_tree/node_refresh';

export function createNodeRefreshMock() {
  return createMockInstance(NodeRefresh);
}

