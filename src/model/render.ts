import { Note, Size } from "./types";

type InitProps = {
  size: Size;
  notes: Note[];
};
type UpdateProps = {
  notes: Note[];
  minNote: number;
  maxNote: number;
  size: Size;
  enabledTracks: Set<number>;
  elapsedSec: number;
  timeRangeSec: number;
  force: boolean;
};
export type RendererModule = {
  init: (svg: SVGSVGElement, props: InitProps) => void;
  update: (svg: SVGSVGElement, props: UpdateProps) => void;
};
export function importRendererModule(url: string): Promise<RendererModule> {
  return import(url) as Promise<RendererModule>;
}
