import { useEffect, useRef, useState } from "react";
import { Image, Mutables, Note } from "@/model/types";
import { applyPatch, createPatch } from "@/model/render";
import { Display, DisplayApi } from "./Display";
import { PlayerControl } from "./PlayerControl";
import { useCounter } from "@/counter";

type Props = {
  notes: Note[];
  image: Image;
  audioBuffer: AudioBuffer | null;
  mutablesRef: React.MutableRefObject<Mutables>;
  midiOffsetInSec: number;
  audioOffsetInSec: number;
};

type PlayingState = {
  startTime: number;
  timer: number;
};

export const Player = ({
  notes,
  image,
  audioBuffer,
  mutablesRef,
  midiOffsetInSec,
  audioOffsetInSec,
}: Props) => {
  useCounter("Player");
  const timeRangeSec = 10;
  const displayRef = useRef<DisplayApi>(null);
  const [audioBufferSource, setAudioBufferSource] =
    useState<AudioBufferSourceNode | null>(null);
  const [playingState, setPlayingState] = useState<PlayingState | null>(null);
  const [offsetInSec, setOffsetInSec] = useState(0);
  const handlePlay = () => {
    if (audioBuffer) {
      const ctx = new AudioContext();
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      const offset = offsetInSec + audioOffsetInSec;
      if (offset > 0) {
        source.start(0, offset);
      } else {
        source.start(-offset);
      }
      setAudioBufferSource(source);
    }
    const startTime = performance.now();
    const timer = window.setInterval(() => {
      const display = displayRef.current!;
      const rects = display.getNoteRects();
      const { minNote, maxNote, size, enabledTracks } = mutablesRef.current;
      const elapsedSec =
        offsetInSec + midiOffsetInSec + (performance.now() - startTime) / 1000;
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
    }, 1000 / 60);
    setPlayingState({
      startTime,
      timer,
    });
  };
  const handleReturn = () => {
    handlePause();
    setOffsetInSec(0);
  };
  const handlePause = () => {
    if (audioBufferSource) {
      audioBufferSource.stop();
      setAudioBufferSource(null);
    }
    if (playingState) {
      clearInterval(playingState.timer);
      setOffsetInSec(
        offsetInSec + (performance.now() - playingState.startTime) / 1000
      );
      setPlayingState(null);
    }
  };
  useEffect(() => {
    if (playingState != null) {
      return;
    }
    const display = displayRef.current!;
    const { minNote, maxNote, size, enabledTracks } = mutablesRef.current;
    const rects = display.getNoteRects();
    const elapsedSec = offsetInSec + midiOffsetInSec;
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
  }, [notes, mutablesRef, playingState, offsetInSec, midiOffsetInSec]);
  return (
    <div style={{ width: image.size.width }}>
      <Display
        apiRef={displayRef}
        size={image.size}
        imageUrl={image.url}
        notes={notes}
      />
      <PlayerControl
        isPlaying={playingState != null}
        onPlay={handlePlay}
        onPause={handlePause}
        onReturn={handleReturn}
        startTime={playingState?.startTime ?? null}
      />
    </div>
  );
};
