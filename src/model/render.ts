import { InitOptions, ModuleConfig, UpdateOptions } from "./types";

export type RendererInfo = {
  url: string;
};
export type RendererState =
  | {
      type: "Loading";
      module?: never;
    }
  | {
      type: "Error";
      module?: never;
    }
  | {
      type: "Ready";
      module: RendererModule;
    };
export type RendererModule<T = Record<string, number>> = {
  config: ModuleConfig;
  init: (svg: SVGSVGElement, props: InitOptions<T>) => void;
  update: (svg: SVGSVGElement, props: UpdateOptions<T>) => void;
};

const root = window.location.origin;
const ext = import.meta.env.DEV ? ".mts" : ".mjs";
export const renderers: (RendererInfo & { name: string })[] = [
  {
    name: "Default",
    url: `${root}/renderer/default${ext}`,
  },
  {
    name: "Bubble",
    url: `${root}/renderer/bubble${ext}`,
  },
  {
    name: "Arch",
    url: `${root}/renderer/arch${ext}`,
  },
  {
    name: "Depth",
    url: `${root}/renderer/depth${ext}`,
  },
  {
    name: "Layer",
    url: `${root}/renderer/layer${ext}`,
  },
];
export function importRendererModule(url: string): Promise<RendererModule> {
  return import(/* @vite-ignore */ url) as Promise<RendererModule>;
}
