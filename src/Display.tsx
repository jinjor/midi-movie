import React, { useEffect, useRef } from "react";
import { Note, Size } from "./model";

export type DisplayApi = {
  getNoteRects: () => NodeListOf<SVGRectElement>;
};

type Props = {
  apiRef: React.MutableRefObject<DisplayApi | null>;
  size: Size;
  imageUrl: string | null;
  notes: Note[];
};

export const Display = ({ apiRef, size, imageUrl, notes }: Props) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  useEffect(() => {
    apiRef.current = {
      getNoteRects: () => {
        return svgRef.current!.querySelectorAll(
          ".note"
        ) as unknown as NodeListOf<SVGRectElement>;
      },
    };
  }, [apiRef]);
  return (
    <svg
      className="display"
      ref={svgRef}
      width={size.width}
      height={size.height}
      style={{
        backgroundImage: imageUrl
          ? `linear-gradient(
          rgba(0, 0, 0, 0.6), 
          rgba(0, 0, 0, 0.6)
        ),url(${imageUrl})`
          : undefined,
      }}
    >
      <rect
        x={size.width / 2}
        y={0}
        width={0.5}
        height={size.height}
        fill="#aaa"
      />
      {notes.map((_note, i) => {
        return <rect className="note" key={i} />;
      })}
    </svg>
  );
};
