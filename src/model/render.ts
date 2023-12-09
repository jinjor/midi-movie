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
  customProps: Record<string, number>;
};
type UpdateProps = {
  notes: Note[];
  size: Size;
  enabledTracks: boolean[];
  elapsedSec: number;
  customProps: Record<string, number>;
  playing: boolean;
};

const root = window.location.origin;
const ext =
  window.location.port === "5173" || window.location.port === "5174"
    ? ".mts"
    : ".mjs";
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
];
export function importRendererModule(url: string): Promise<RendererModule> {
  return import(/* @vite-ignore */ url) as Promise<RendererModule>;
}
