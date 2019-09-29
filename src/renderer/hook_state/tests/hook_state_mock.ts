import { createMockInstance } from '/src/renderer/util/tests';
import { HookState } from '../hook_state';

export function createHookStateMock() {
  return createMockInstance(HookState);
}
