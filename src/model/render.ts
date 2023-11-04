import { Note, Size } from "./types";

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
  enabledTracks: Set<number>;
  elapsedSec: number;
  customProps: Record<string, number>;
  force: boolean;
};
export type RendererModule = {
  config: Config;
  init: (svg: SVGSVGElement, props: InitProps) => void;
  update: (svg: SVGSVGElement, props: UpdateProps) => void;
};
export function importRendererModule(url: string): Promise<RendererModule> {
  return import(url) as Promise<RendererModule>;
}
