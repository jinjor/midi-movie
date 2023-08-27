import { useEffect, useRef, useState } from "react";
import "./App.css";
import { FileInput } from "./FileUpload";

import { Tracks } from "./Tracks";
import { Note, Track, parseMidiData } from "./midi";

function App() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [size, setSize] = useState<Size>({
    width: 512,
    height: 512 * (9 / 16),
  });
  const [notes, setNotes] = useState<Note[]>([]);
  const minNoteRef = useRef<number>(0);
  const maxNoteRef = useRef<number>(127);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [enabledTracks, setEnabledTracks] = useState<boolean[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timer, setTimer] = useState<number | null>(null);
  const timeRangeSec = 10;

  const handlePlay = () => {
    const svg = svgRef.current!;
    const startTime = performance.now();
    setStartTime(startTime);
    setTimer(
      setInterval(() => {
        const rects = svg.querySelectorAll(
          ".note"
        ) as unknown as NodeListOf<SVGRectElement>;
        const minNote = minNoteRef.current;
        const maxNote = maxNoteRef.current;
        for (const [index, note] of notes.entries()) {
          const rect = rects[index];
          const elapsedSec = (performance.now() - startTime) / 1000;
          const patch = createPatch(
            size,
            note,
            elapsedSec,
            minNote,
            maxNote,
            timeRangeSec,
            false
          );
          if (patch != null) {
            applyPatch(rect, patch);
          }
        }
      }, 1000 / 60)
    );
  };
  const handleStop = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    setStartTime(null);
  };
  const handleLoadMidi = (file: File) => {
    void (async () => {
      const buffer = await file.arrayBuffer();
      const { tracks, notes } = parseMidiData(buffer);
      setNotes(notes);
      setTracks(tracks);
      setEnabledTracks(new Array(tracks.length).fill(true));
    })();
  };
  const handleLoadImage = (file: File) => {
    void (async () => {
      const buffer = await file.arrayBuffer();
      const size = await getImageSize(file);
      const blob = new Blob([buffer], { type: file.type });
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      setSize(size);
    })();
  };
  const handleSelectTracks = (enabledTracks: boolean[]) => {
    setEnabledTracks(enabledTracks);
  };
  useEffect(() => {
    const svg = svgRef.current!;
    const minNote = minNoteRef.current;
    const maxNote = maxNoteRef.current;
    const rects = svg.querySelectorAll(
      ".note"
    ) as unknown as NodeListOf<SVGRectElement>;
    for (const [index, note] of notes.entries()) {
      const hidden =
        !enabledTracks[note.trackIndex] ||
        note.noteNumber < minNote ||
        note.noteNumber > maxNote;
      const rect = rects[index];
      const elapsedSec =
        startTime != null ? (performance.now() - startTime) / 1000 : 0;
      const patch = createPatch(
        size,
        note,
        elapsedSec,
        minNote,
        maxNote,
        timeRangeSec,
        true
      );
      applyPatch(rect, patch!);
      rect.style.display = hidden ? "none" : "block";
    }
  }, [size, notes, startTime, enabledTracks]);
  return (
    <div className="panes">
      <div className="pane resourcePane fields">
        <label>
          <span>MIDI:</span>
          <FileInput onLoad={handleLoadMidi} extensions={[".mid", ".midi"]} />
        </label>
        <label>
          <span>Image:</span>
          <FileInput
            onLoad={handleLoadImage}
            extensions={[".png", "jpg", "jpeg"]}
          />
        </label>
      </div>
      <div className="pane trackPane">
        <Tracks
          tracks={tracks}
          enabledTracks={enabledTracks}
          onChange={handleSelectTracks}
        />
      </div>
      <div className="pane previewPane">
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
        <div className="controls">
          {startTime == null ? (
            <button onClick={handlePlay}>play</button>
          ) : (
            <button onClick={handleStop}>stop</button>
          )}
        </div>
      </div>
      <div className="pane propertyPane fields">
        <label>
          Min note:
          <input
            type="number"
            defaultValue={minNoteRef.current}
            onChange={(e) => {
              minNoteRef.current = Number(e.target.value);
            }}
          />
        </label>
        <label>
          Max note:
          <input
            type="number"
            defaultValue={maxNoteRef.current}
            onChange={(e) => {
              maxNoteRef.current = Number(e.target.value);
            }}
          />
        </label>
      </div>
    </div>
  );
}

function createPatch(
  size: Size,
  note: Note,
  elapsedSec: number,
  minNote: number,
  maxNote: number,
  timeRangeSec: number,
  force: boolean
): Record<string, string | number> | null {
  const heightPerNote = size.height / (maxNote - minNote);
  const widthPerSec = size.width / timeRangeSec;
  const decaySec = 0.2;
  const releaseSec = 0.4;
  const minHue = 0;
  const maxHue = 240;
  const hue =
    ((note.noteNumber - minNote) / (maxNote - minNote)) * (maxHue - minHue) +
    minHue;
  const peakLightness = 100;
  const activeLightness = 80;
  const baseLightness = 30;
  const lightness =
    elapsedSec < note.fromSec
      ? baseLightness
      : elapsedSec < note.toSec
      ? activeLightness +
        (peakLightness - activeLightness) *
          Math.exp(-(elapsedSec - note.fromSec) / decaySec)
      : baseLightness +
        (activeLightness - baseLightness) *
          Math.exp(-(elapsedSec - note.toSec) / releaseSec);
  const x = (note.fromSec - elapsedSec + timeRangeSec / 2) * widthPerSec;
  const y = size.height - (note.noteNumber - minNote) * heightPerNote;
  const width = (note.toSec - note.fromSec) * widthPerSec;
  const height = heightPerNote;
  if (!force && (x + width < 0 || x > size.width)) {
    return null;
  }
  return {
    x,
    y,
    width,
    height,
    fill: `hsl(${hue}, 20%, ${lightness}%)`,
  };
}
function applyPatch(el: SVGElement, patch: Record<string, string | number>) {
  for (const [key, value] of Object.entries(patch)) {
    el.setAttributeNS(null, key, String(value));
  }
}

export default App;

type Size = { width: number; height: number };
async function getImageSize(file: File): Promise<Size> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const size = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };

      URL.revokeObjectURL(img.src);
      resolve(size);
    };

    img.onerror = (error) => {
      reject(error);
    };

    img.src = URL.createObjectURL(file);
  });
}
