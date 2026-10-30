import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

// Mock thinking-orbs — its canvas/IntersectionObserver rendering has no
// jsdom equivalent.
vi.mock("thinking-orbs", () => ({
  ThinkingOrb: () => null,
}));

/**
 * Polyfill localStorage/sessionStorage for Node 20+ runtime (Node 26 ships an
 * experimental global that returns `undefined` without --localstorage-file).
 * jsdom-provided ones are shadowed by the Node global; we override once per
 * test with a fresh in-memory implementation.
 */
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() { return this.store.size; }
  clear() { this.store.clear(); }
  getItem(k: string) { return this.store.has(k) ? this.store.get(k)! : null; }
  key(i: number) { return Array.from(this.store.keys())[i] ?? null; }
  removeItem(k: string) { this.store.delete(k); }
  setItem(k: string, v: string) { this.store.set(k, String(v)); }
}

beforeEach(() => {
  Object.defineProperty(globalThis, "localStorage", {
    value: new MemoryStorage(),
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    value: new MemoryStorage(),
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  cleanup();
});
