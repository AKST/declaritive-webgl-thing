import { Context, Element } from '/src/renderer/base';
import { createElement } from '/src/renderer/element/element';

export function createContextFactory() {
  let lastContextKey = 0;

  return <T>(): Context<T> => {
    const key = lastContextKey++;

    return {
      key,
      Producer: ({ children, value }): Element => (
          createElement('set-context', { key, value, children })
      ),
    };
  };
}

export type ContextObserver = {
  onContextChange(): void;
};

export class ContextNode {
  private lastListener = 1;
  private readonly subscribers: Map<number, ContextObserver> = new Map();

  constructor(
      private parent: ContextNode | undefined,
      private key: number,
      private value: any,
  ) {}

  getContextOf(key: number): ContextNode | undefined {
    if (this.key === key) {
      return this;
    } else if (this.parent) {
      return this.parent.getContextOf(key);
    } else {
      return undefined;
    }
  }

  subscribe(onContextChange: () => void): () => void {
    const thisListener = this.lastListener++;
    this.subscribers.set(thisListener, { onContextChange });
    return () => this.subscribers.delete(thisListener);
  }

  setValue(value: any) {
    this.value = value;

    for (const { onContextChange } of this.subscribers.values()) {
      onContextChange();
    }
  }

  getValue(): any {
    return this.value;
  }
}

export { Context }
