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
export type RendererModuleMeta = {
  index: number;
  name: string;
};
export type RendererModule<T = Record<string, number>> = {
  meta: RendererModuleMeta;
  config: ModuleConfig;
  init: (svg: SVGSVGElement, props: InitOptions<T>) => void;
  update: (svg: SVGSVGElement, props: UpdateOptions<T>) => void;
};

const root = window.location.origin;
const ext = import.meta.env.DEV ? ".mts" : ".mjs";
const localRendererPaths: string[] =
  import.meta.env.VITE_LOCAL_RENDERER_PATHS.split(" ");
export const renderers: RendererInfo[] = localRendererPaths.map((path) => ({
  url: `${root}${path}${ext}`,
}));
export function importRendererModule(url: string): Promise<RendererModule> {
  return import(/* @vite-ignore */ url) as Promise<RendererModule>;
}
