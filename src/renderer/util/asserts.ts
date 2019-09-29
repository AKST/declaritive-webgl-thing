export function assertExists<T>(value: null, message?: string): never;
export function assertExists<T>(value: undefined, message?: string): never;
export function assertExists<T>(value: T | undefined | null, message?: string): T;
export function assertExists<T>(value: T | undefined | null, message?: string): T {
  if (value == null) {
    let errorMessage = `value of "${value}" is undefined`;
    if (message != null) errorMessage += `: ${message}`;
    throw new Error(errorMessage);
  }
  return value;
}

export class UnreachableError extends Error {
  constructor(value: never) {
    super('' + value);
  }
}
