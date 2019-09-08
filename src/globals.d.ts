interface Window {
  requestIdleCallback?(callback: () => void): number;
  cancelIdleCallback?(id?: number): void;
}
