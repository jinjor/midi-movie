import { globalStyle, style } from "@vanilla-extract/css";

export const fields = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "5px",
});

export const pane = style({
  padding: "20px",
  backgroundColor: "var(--color-bg-foreground)",
  border: "solid 1px var(--color-bg-background)",
});

export const panes = style({
  display: "grid",
  gridTemplateRows: "150px 1fr",
  gridTemplateColumns: "250px 1fr 350px",
});

export const playerPane = style({
  gridRow: "2",
  gridColumn: "2",
});

export const propertyPane = style({
  gridRow: "2",
  gridColumn: "3",
});

export const resourcePane = style({
  gridRow: "1",
  gridColumn: "1 / span 3",
});

export const trackPane = style({
  gridRow: "2",
  gridColumn: "1",
});

globalStyle("label", {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
});
