import { useEffect, useRef, useState } from "react";
import { Image, Mutables, Note } from "./model";
import { applyPatch, createPatch } from "./render";
import { Display, DisplayApi } from "./Display";
import { PlayerControl } from "./PlayerControl";

type Props = {
  notes: Note[];
  image: Image;
  audioBuffer: AudioBuffer | null;
  mutablesRef: React.MutableRefObject<Mutables>;
};

export const Player = ({ notes, image, audioBuffer, mutablesRef }: Props) => {
  const timeRangeSec = 10;
  const displayRef = useRef<DisplayApi>(null);
  const [audioBufferSource, setAudioBufferSource] =
    useState<AudioBufferSourceNode | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timer, setTimer] = useState<number | null>(null);
  const handlePlay = () => {
    if (audioBuffer) {
      const ctx = new AudioContext();
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
      setAudioBufferSource(source);
    }
    const startTime = performance.now();
    setStartTime(startTime);
    setTimer(
      setInterval(() => {
        const display = displayRef.current!;
        const rects = display.getNoteRects();
        const { minNote, maxNote, size, enabledTracks } = mutablesRef.current;
        const elapsedSec = (performance.now() - startTime) / 1000;
        for (const [index, note] of notes.entries()) {
          const rect = rects[index];
          const hidden =
            !enabledTracks.has(note.trackIndex) ||
            note.noteNumber < minNote ||
            note.noteNumber > maxNote;
          const patch = createPatch(
            size,
            note,
            elapsedSec,
            minNote,
            maxNote,
            timeRangeSec,
            false
          );
          const stylePatch = { display: hidden ? "none" : "block" };
          applyPatch(rect, stylePatch, patch ?? {});
        }
      }, 1000 / 60)
    );
  };
  const handleStop = () => {
    if (audioBufferSource) {
      audioBufferSource.stop();
      setAudioBufferSource(null);
    }
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    setStartTime(null);
  };
  useEffect(() => {
    const display = displayRef.current!;
    const { minNote, maxNote, size, enabledTracks } = mutablesRef.current;
    const rects = display.getNoteRects();
    const elapsedSec =
      startTime != null ? (performance.now() - startTime) / 1000 : 0;
    for (const [index, note] of notes.entries()) {
      const hidden =
        !enabledTracks.has(note.trackIndex) ||
        note.noteNumber < minNote ||
        note.noteNumber > maxNote;
      const rect = rects[index];
      const patch = createPatch(
        size,
        note,
        elapsedSec,
        minNote,
        maxNote,
        timeRangeSec,
        true
      );
      const stylePatch = { display: hidden ? "none" : "block" };
      applyPatch(rect, stylePatch, patch!);
    }
  }, [notes, startTime, mutablesRef]);
  return (
    <div style={{ width: image.size.width }}>
      <Display
        apiRef={displayRef}
        size={image.size}
        imageUrl={image.url}
        notes={notes}
      />
      <PlayerControl
        isPlaying={timer != null}
        onPlay={handlePlay}
        onStop={handleStop}
        startTime={startTime}
      />
    </div>
  );
};
