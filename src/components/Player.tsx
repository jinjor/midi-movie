import { useEffect, useRef, useState } from "react";
import { applyPatch, createPatch } from "@/model/render";
import { Display, DisplayApi } from "./Display";
import { PlayerControl } from "./PlayerControl";
import { useCounter } from "@/counter";
import { useAtom, useAtomValue } from "jotai";
import {
  audioBufferAtom,
  audioOffsetAtom,
  currentTimeInSecAtom,
  enabledTracksAtom,
  imageSizeAtom,
  imageUrlAtom,
  maxNoteAtom,
  midiOffsetAtom,
  minNoteAtom,
  notesAtom,
} from "@/atoms";
import { SeekBar } from "@/ui/SeekBar";

type PlayingState = {
  startTime: number;
  timer: number;
};

export const Player = () => {
  useCounter("Player");
  const midiOffsetInSec = useAtomValue(midiOffsetAtom);
  const audioOffsetInSec = useAtomValue(audioOffsetAtom);
  const minNote = useAtomValue(minNoteAtom);
  const maxNote = useAtomValue(maxNoteAtom);
  const imageUrl = useAtomValue(imageUrlAtom);
  const size = useAtomValue(imageSizeAtom);
  const notes = useAtomValue(notesAtom);
  const enabledTracks = useAtomValue(enabledTracksAtom);
  const audioBuffer = useAtomValue(audioBufferAtom);
  const mutablesRef = useRef({
    minNote,
    maxNote,
    size,
    enabledTracks,
  });
  useEffect(() => {
    mutablesRef.current = {
      minNote,
      maxNote,
      size,
      enabledTracks,
    };
  }, [minNote, maxNote, size, enabledTracks]);

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
  }, [
    notes,
    playingState,
    offsetInSec,
    midiOffsetInSec,
    enabledTracks,
    minNote,
    maxNote,
    size,
  ]);

  const [currentTimeInSec, setCurrentTimeInSec] = useAtom(currentTimeInSecAtom);
  useEffect(() => {
    if (playingState === null) {
      setCurrentTimeInSec(null);
      return;
    }
    const timer = setInterval(() => {
      setCurrentTimeInSec(
        Math.floor((performance.now() - playingState.startTime) / 1000)
      );
    }, 1000 / 10);
    return () => clearInterval(timer);
  }, [playingState, setCurrentTimeInSec]);

  return (
    <div style={{ width: size.width }}>
      <Display
        apiRef={displayRef}
        size={size}
        imageUrl={imageUrl}
        notes={notes}
      />
      <PlayerControl
        isPlaying={playingState != null}
        onPlay={handlePlay}
        onPause={handlePause}
        onReturn={handleReturn}
        startTime={playingState?.startTime ?? null}
        seekBar={
          <SeekBar
            disabled={audioBuffer == null}
            value={
              currentTimeInSec && audioBuffer
                ? currentTimeInSec / audioBuffer.duration
                : offsetInSec / audioBuffer!.duration
            }
            onStartDragging={(ratio) => {
              handlePause();
              audioBuffer && setOffsetInSec(audioBuffer.duration * ratio);
            }}
            onStopDragging={() => {
              // TODO
            }}
            onDrag={(ratio) => {
              audioBuffer && setOffsetInSec(audioBuffer.duration * ratio);
            }}
          />
        }
      />
    </div>
  );
};
