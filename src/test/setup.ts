import "@testing-library/jest-dom";
import "./matchers";

// https://github.com/vitest-dev/vitest/issues/3283
if (typeof window !== "undefined") {
  // @ts-expect-error hack the react preamble
  window.__vite_plugin_react_preamble_installed__ = true;
}
