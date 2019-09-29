/**
 * Traverses the proto tree and attachs mock functions as names to the different
 * methods of the class passed in, & at the end it just casts it to the type.
 */
export function createMockInstance<T>(klass: { new (...ts: any[]): T }): jest.Mocked<T> {
  const instance = Object.create(klass.prototype);
  const visited = new Set<string>();

  let proto = instance;
  while (proto !== Object.prototype) {
    for (const propName of Object.getOwnPropertyNames(proto)) {
      if (visited.has(propName)) continue;
      if (propName === 'constructor') continue;

      visited.add(propName);

      const descriptor = Object.getOwnPropertyDescriptor(proto, propName)
      const descriptorValue = descriptor && descriptor.value;
      if (typeof descriptorValue === 'function') {
        const nameOfMock = `${klass.constructor.name}::${propName}`;
        instance[propName] = jest.fn().mockName(nameOfMock);
      }
    }
    proto = Object.getPrototypeOf(proto);
  }

  return instance as jest.Mocked<T>;
}
