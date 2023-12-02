import { ModulePropDef } from "@/model/types";

type ModulePropDefCreator = (...args: any[]) => ModulePropDef;

export const makeNote = (<ID extends string>(defs: {
  id: ID;
  name: string;
  defaultValue: number;
}) => {
  return {
    type: "number",
    min: 0,
    max: 127,
    step: 1,
    ...defs,
  } as const;
}) satisfies ModulePropDefCreator;

export const minNote = (defaultValue: number) => {
  return makeNote({
    id: "minNote",
    name: "Min Note",
    defaultValue,
  });
};

export const maxNote = (defaultValue: number) => {
  return makeNote({
    id: "maxNote",
    name: "Max Note",
    defaultValue,
  });
};

export const timeRangeSec = ((defaultValue: number) => {
  return {
    id: "timeRangeSec",
    name: "Time Range (sec)",
    type: "number",
    min: 1,
    max: 20,
    step: 1,
    defaultValue,
  } as const;
}) satisfies ModulePropDefCreator;

export const makeHue = (<ID extends string>(defs: {
  id: ID;
  name: string;
  defaultValue: number;
}) => {
  return {
    type: "number",
    min: -360,
    max: 360,
    step: 5,
    ...defs,
  } as const;
}) satisfies ModulePropDefCreator;

export const minHue = (defaultValue: number) => {
  return makeHue({
    id: "minHue",
    name: "Min Hue",
    defaultValue,
  });
};

export const maxHue = (defaultValue: number) => {
  return makeHue({
    id: "maxHue",
    name: "Max Hue",
    defaultValue,
  });
};

export const makeLightness = (<ID extends string>(defs: {
  id: ID;
  name: string;
  defaultValue: number;
}) => {
  return {
    type: "number",
    min: 0,
    max: 100,
    step: 5,
    ...defs,
  } as const;
}) satisfies ModulePropDefCreator;

export const baseLightness = (defaultValue: number) =>
  makeLightness({
    id: "baseLightness",
    name: "Base Lightness",
    defaultValue,
  });

export const peakLightness = (defaultValue: number) =>
  makeLightness({
    id: "peakLightness",
    name: "Peak Lightness",
    defaultValue,
  });

export const activeLightness = (defaultValue: number) =>
  makeLightness({
    id: "activeLightness",
    name: "Active Lightness",
    defaultValue,
  });

export const beforeLightness = (defaultValue: number) =>
  makeLightness({
    id: "beforeLightness",
    name: "Before Lightness",
    defaultValue,
  });

export const afterLightness = (defaultValue: number) =>
  makeLightness({
    id: "afterLightness",
    name: "After Lightness",
    defaultValue,
  });

type ThicknessOptions = {
  min?: number;
  max?: number;
  step?: number;
};

export const makeThickness = (<ID extends string>(
  defs: {
    id: ID;
    name: string;
    defaultValue: number;
  } & ThicknessOptions,
) => {
  return {
    type: "number",
    min: 0,
    max: 1,
    step: 0.05,
    ...defs,
  } as const;
}) satisfies ModulePropDefCreator;

export const thickness = (
  defaultValue: number,
  options: ThicknessOptions = {},
) =>
  makeThickness({
    id: "thickness",
    name: "Thickness",
    defaultValue,
    ...options,
  });

export const baseThickness = (
  defaultValue: number,
  options: ThicknessOptions = {},
) =>
  makeThickness({
    id: "baseThickness",
    name: "Base Thickness",
    defaultValue,
    ...options,
  });

export const peakThickness = (
  defaultValue: number,
  options: ThicknessOptions = {},
) =>
  makeThickness({
    id: "peakThickness",
    name: "Peak Thickness",
    defaultValue,
    ...options,
  });

export const activeThickness = (
  defaultValue: number,
  options: ThicknessOptions = {},
) =>
  makeThickness({
    id: "activeThickness",
    name: "Active Thickness",
    defaultValue,
    ...options,
  });

export const beforeThickness = (
  defaultValue: number,
  options: ThicknessOptions = {},
) =>
  makeThickness({
    id: "beforeThickness",
    name: "Before Thickness",
    defaultValue,
    ...options,
  });

export const afterThickness = (
  defaultValue: number,
  options: ThicknessOptions = {},
) =>
  makeThickness({
    id: "afterThickness",
    name: "After Thickness",
    defaultValue,
    ...options,
  });

export const vertical = ((defaultValue: number) =>
  ({
    id: "vertical",
    name: "Vertical",
    type: "number",
    min: 0,
    max: 1,
    step: 1,
    defaultValue,
  }) as const) satisfies ModulePropDefCreator;

export const lineCap = ((defaultValue: number) =>
  ({
    id: "lineCap",
    name: "Line Cap",
    type: "number",
    min: 0,
    max: 1,
    step: 1,
    defaultValue,
  }) as const) satisfies ModulePropDefCreator;