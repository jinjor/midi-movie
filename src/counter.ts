import { useCallback, useRef } from "react";

type Count = Map<string, Map<string, LifecycleCount>>;
type LifecycleCount = {
  mount: number;
  render: number;
  callback: Map<string, number>;
};
const randomId = () => Math.random().toString(36).slice(2);
export const count: Count = new Map();
export const resetCount = () => {
  count.clear();
};
export const getMountCount = (key: string) => {
  const lifecycleMap = count.get(key);
  const lifecycles = lifecycleMap ? [...lifecycleMap.values()] : [];
  const value = lifecycles.reduce((acc, { mount }) => acc + mount, 0);
  return value;
};
export const getTotalRenderCount = (key: string) => {
  const lifecycleMap = count.get(key);
  const lifecycles = lifecycleMap ? [...lifecycleMap.values()] : [];
  const value = lifecycles.reduce((acc, { render }) => acc + render, 0);
  return value;
};
export const getTotalCallbackCount = (key: string, callbackKey: string) => {
  const lifecycleMap = count.get(key);
  const lifecycles = lifecycleMap ? [...lifecycleMap.values()] : [];
  return lifecycles.reduce(
    (acc, { callback }) => acc + (callback.get(callbackKey) ?? 0),
    0,
  );
};
export const getMountedKeys = () => {
  return [...count.keys()].filter((key) => getMountCount(key) > 0);
};
export const getRenderedKeys = () => {
  return [...count.keys()].filter((key) => getTotalRenderCount(key) > 0);
};
const ensureLifecycle = (
  key: string,
  mountKey: string,
  shouldCountMount: boolean,
) => {
  if (!count.has(key)) {
    count.set(key, new Map());
  }
  const lifecycles = count.get(key)!;
  if (!lifecycles.has(mountKey)) {
    lifecycles.set(mountKey, {
      mount: shouldCountMount ? 1 : 0,
      render: 0,
      callback: new Map(),
    });
  }
  return lifecycles.get(mountKey)!;
};
const updateCallbackCount = (
  key: string,
  mountKey: string,
  callbackKey: string,
) => {
  const lifecycle = ensureLifecycle(key, mountKey, false);
  const map = lifecycle.callback;
  if (!map.has(callbackKey)) {
    map.set(callbackKey, 0);
  }
  map.set(callbackKey, map.get(callbackKey)! + 1);
};
export const useCounter = (key: string) => {
  const mountKeyRef = useRef<string | null>(null);
  const shouldCountMount = mountKeyRef.current === null;
  if (mountKeyRef.current === null) {
    mountKeyRef.current = randomId();
  }
  const mountKey = mountKeyRef.current;
  const lifecycle = ensureLifecycle(key, mountKey, shouldCountMount);
  lifecycle.render++;
  const countCallback = useCallback(
    (callbackKey: string) => updateCallbackCount(key, mountKey, callbackKey),
    [key, mountKey],
  );
  return {
    countCallback,
  };
};
