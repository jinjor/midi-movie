import { Note, Size } from "./types";

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
export type RendererModule = {
  config: Config;
  init: (svg: SVGSVGElement, props: InitProps) => void;
  update: (svg: SVGSVGElement, props: UpdateProps) => void;
};
type Config = {
  props: {
    id: string;
    name: string;
    type: "number";
    min: number;
    max: number;
    step: number;
    defaultValue: number;
  }[];
};
type InitProps = {
  size: Size;
  notes: Note[];
};
type UpdateProps = {
  notes: Note[];
  size: Size;
  enabledTracks: boolean[];
  elapsedSec: number;
  customProps: Record<string, number>;
  playing: boolean;
};

const root = `${window.location.origin}/midi-movie`;
export const renderers: (RendererInfo & { name: string })[] = [
  {
    name: "Default",
    url: `${root}/renderer/default.mjs`,
  },
  {
    name: "Bubble",
    url: `${root}/renderer/bubble.mjs`,
  },
  {
    name: "Arch",
    url: `${root}/renderer/arch.mjs`,
  },
];
export function importRendererModule(url: string): Promise<RendererModule> {
  return import(/* @vite-ignore */ url) as Promise<RendererModule>;
}
