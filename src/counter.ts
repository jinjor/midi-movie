import { useCallback, useRef } from "react";

type Count = Map<string, LifecycleCount[]>;
type LifecycleCount = {
  render: number;
  effect: Map<string, number>;
  callback: Map<string, number>;
};
const isDevMode = () => {
  return import.meta.env.DEV;
};
export const count: Count = new Map();
export const resetCount = () => {
  count.clear();
};
export const getTotalRenderCount = (key: string) => {
  const lifecycles = count.get(key);
  const value = (lifecycles ?? []).reduce((acc, { render }) => acc + render, 0);
  return isDevMode() ? value / 2 : value;
};
export const getTotalEffectCount = (key: string, effectKey: string) => {
  const lifecycles = count.get(key);
  return (lifecycles ?? []).reduce((acc, { effect }) => {
    const count = effect.has(effectKey)
      ? effect.get(effectKey)! - (isDevMode() ? 1 : 0)
      : 0;
    return acc + count;
  }, 0);
};
export const getTotalCallbackCount = (key: string, callbackKey: string) => {
  const lifecycles = count.get(key);
  return (lifecycles ?? []).reduce(
    (acc, { callback }) => acc + (callback.get(callbackKey) ?? 0),
    0
  );
};
export const getMountCount = (key: string) => {
  const lifecycles = count.get(key);
  const value = lifecycles?.length ?? 0;
  return isDevMode() ? value / 2 : value;
};

const updateCallbackCount = (
  kind: "effect" | "callback",
  key: string,
  secondKey: string
) => {
  const map = count.get(key)![0][kind];
  if (!map.has(secondKey)) {
    map.set(secondKey, 0);
  }
  map.set(secondKey, map.get(secondKey)! + 1);
};
export const useCounter = (key: string) => {
  if (!count.has(key)) {
    count.set(key, []);
  }
  const lifecycles = count.get(key)!;
  const firstTime = useRef(true);
  if (firstTime.current) {
    lifecycles.unshift({
      render: 0,
      effect: new Map(),
      callback: new Map(),
    });
  } else if (lifecycles.length === 0) {
    // mount数の調整
    for (let i = 0; i < (isDevMode() ? 2 : 1); i++) {
      lifecycles.unshift({
        render: 0,
        effect: new Map(),
        callback: new Map(),
      });
    }
  }
  firstTime.current = false;
  lifecycles[0].render++;
  const countCallback = useCallback(
    (subKey: string) => updateCallbackCount("callback", key, subKey),
    [key]
  );
  const countEffect = useCallback(
    (subKey: string) => updateCallbackCount("effect", key, subKey),
    [key]
  );
  return {
    countCallback,
    countEffect,
  };
};
