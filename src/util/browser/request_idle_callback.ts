export function createRequestIdleCallback() {
  const requestIdleCallback = (window.requestIdleCallback || window.setTimeout).bind(window);
  const cancelIdleCallback = (window.cancelIdleCallback || window.clearTimeout).bind(window);
  return { requestIdleCallback, cancelIdleCallback };
}
