import { style } from "@vanilla-extract/css";

export const bar = style({
  width: "100%",
  height: "4px",
  backgroundColor: "#e6e6e6",
  borderRadius: "2px",
  position: "relative",
  cursor: "pointer",
  marginTop: "10px",
  marginBottom: "10px",
  userSelect: "none",
});

export const progress = style({
  selectors: {
    [`${bar} &`]: {
      position: "absolute",
      top: "0",
      left: "0",
      height: "100%",
      backgroundColor: "#1db954",
      borderRadius: "2px",
      pointerEvents: "none",
    },
  },
});

export const knob = style({
  selectors: {
    [`${bar} ${progress} &`]: {
      position: "absolute",
      top: "calc(50% - 6px)",
      right: "-6px",
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      backgroundColor: "#1db954",
      cursor: "pointer",
    },
  },
});

export const disabled = style({});
