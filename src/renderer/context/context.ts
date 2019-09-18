import { Context, Element } from '/src/renderer/base';
import { createElement } from '/src/renderer/element/element';

export function createContextFactory() {
  let lastContextKey = 0;

  return <T>(): Context<T> => {
    const key = lastContextKey++;

    return {
      key,
      Producer: ({ children, value }) => (
          createElement('set-context', { key, value, children })
      ),
    };
  };
}

export { Context }
