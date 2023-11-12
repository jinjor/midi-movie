import { Note, Size } from "./types";

export type RendererInfo = {
  name: string;
  url: string;
};
export type RendererState =
  | {
      type: "Loading";
      info: RendererInfo;
      module?: never;
      props?: never;
    }
  | {
      type: "Error";
      info: RendererInfo;
      module?: never;
      props?: never;
    }
  | {
      type: "Ready";
      info: RendererInfo;
      module: RendererModule;
      props: Record<string, number>;
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
};

export const renderers: RendererInfo[] = [
  {
    name: "Default",
    url: `${window.location.origin}/renderer/default.mjs`,
  },
  {
    name: "Vertical",
    url: `${window.location.origin}/renderer/vertical.mjs`,
  },
];
export function importRendererModule(url: string): Promise<RendererModule> {
  return import(url) as Promise<RendererModule>;
}
