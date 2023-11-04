import { useEffect, useRef, useState } from "react";
import { Display, DisplayApi } from "./Display";
import { PlayerControl } from "./PlayerControl";
import { useCounter } from "@/counter";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  audioBufferAtom,
  audioOffsetAtom,
  currentTimeInSecAtom,
  enabledTracksAtom,
  imageSizeAtom,
  imageUrlAtom,
  midiOffsetAtom,
  midiDataAtom,
  gainNodeAtom,
  volumeAtom,
  rendererAtom,
} from "@/atoms";
import { SeekBar } from "@/ui/SeekBar";

type PlayingState = {
  startTime: number;
  timer: number;
};

const emptyProps = {};
export const Player = () => {
  useCounter("Player");
  const midiOffsetInSec = useAtomValue(midiOffsetAtom);
  const audioOffsetInSec = useAtomValue(audioOffsetAtom);
  const imageUrl = useAtomValue(imageUrlAtom);
  const size = useAtomValue(imageSizeAtom);
  const midiData = useAtomValue(midiDataAtom);
  const enabledTracks = useAtomValue(enabledTracksAtom);
  const audioBuffer = useAtomValue(audioBufferAtom);
  const setGainNode = useSetAtom(gainNodeAtom);
  const volume = useAtomValue(volumeAtom);
  const renderer = useAtomValue(rendererAtom);
  const customProps = renderer.type === "Ready" ? renderer.props : emptyProps;

  const [initialized, setInitialized] = useState(false);
  const mutablesRef = useRef({
    size,
    enabledTracks,
    customProps,
  });
  useEffect(() => {
    mutablesRef.current = {
      size,
      enabledTracks,
      customProps,
    };
  }, [size, enabledTracks, customProps]);

  const [displayApi, setDisplayApi] = useState<DisplayApi | null>(null);
  const [audioBufferSource, setAudioBufferSource] =
    useState<AudioBufferSourceNode | null>(null);
  const [playingState, setPlayingState] = useState<PlayingState | null>(null);
  const [offsetInSec, setOffsetInSec] = useState(0);
  const [restart, setRestart] = useState(false);

  const handlePlay = () => {
    if (renderer.type !== "Ready" || midiData == null) {
      return;
    }
    if (audioBuffer) {
      const ctx = new AudioContext();
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      const gain = ctx.createGain();
      gain.gain.value = volume;
      setGainNode(gain);
      source.connect(gain).connect(ctx.destination);
      const offset = offsetInSec + audioOffsetInSec;
      if (offset > 0) {
        source.start(0, offset);
      } else {
        source.start(-offset);
      }
      setAudioBufferSource(source);
    }
    const module = renderer.module;
    const notes = midiData.notes;
    const startTime = performance.now();
    const timer = window.setInterval(() => {
      const display = displayApi!;
      const svg = display.getContainer();
      const { size, enabledTracks, customProps } = mutablesRef.current;
      const elapsedSec =
        offsetInSec + midiOffsetInSec + (performance.now() - startTime) / 1000;
      module.update(svg, {
        notes,
        size,
        enabledTracks,
        elapsedSec,
        customProps,
        force: false,
      });
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
        offsetInSec + (performance.now() - playingState.startTime) / 1000,
      );
      setPlayingState(null);
    }
  };
  useEffect(() => {
    if (
      playingState != null ||
      displayApi == null ||
      midiData == null ||
      !initialized ||
      renderer.type !== "Ready"
    ) {
      return;
    }
    const notes = midiData.notes;
    const display = displayApi;
    const svg = display.getContainer();
    const elapsedSec = offsetInSec + midiOffsetInSec;
    renderer.module.update(svg, {
      notes,
      size,
      enabledTracks,
      elapsedSec,
      customProps,
      force: true,
    });
  }, [
    midiData,
    playingState,
    offsetInSec,
    midiOffsetInSec,
    enabledTracks,
    size,
    displayApi,
    initialized,
    renderer,
    customProps,
  ]);

  const [currentTimeInSec, setCurrentTimeInSec] = useAtom(currentTimeInSecAtom);
  useEffect(() => {
    if (playingState === null) {
      setCurrentTimeInSec(null);
      return;
    }
    const timer = setInterval(() => {
      setCurrentTimeInSec(
        Math.floor((performance.now() - playingState.startTime) / 1000),
      );
    }, 1000 / 10);
    return () => clearInterval(timer);
  }, [playingState, setCurrentTimeInSec]);

  const module = renderer.type === "Ready" ? renderer.module : null;
  useEffect(() => {
    if (displayApi == null || midiData == null || module == null) {
      return;
    }
    const container = displayApi.getContainer();
    container.innerHTML = "";
    module.init(container, { size, notes: midiData.notes });
    setInitialized(true);
  }, [displayApi, size, midiData, module]);

  const durationForSeekBar = Math.max(
    audioBuffer?.duration ?? 0,
    midiData?.endSec ?? 0,
  );
  return (
    <div style={{ width: size.width }}>
      <Display onMount={setDisplayApi} size={size} imageUrl={imageUrl} />
      <PlayerControl
        isPlaying={playingState != null}
        onPlay={handlePlay}
        onPause={handlePause}
        onReturn={handleReturn}
        offsetInSec={offsetInSec}
        seekBar={
          <SeekBar
            disabled={audioBuffer == null}
            value={(offsetInSec + (currentTimeInSec ?? 0)) / durationForSeekBar}
            onStartDragging={(ratio) => {
              setRestart(currentTimeInSec != null);
              handlePause();
              audioBuffer && setOffsetInSec(durationForSeekBar * ratio);
            }}
            onStopDragging={() => {
              if (restart) {
                handlePlay();
              }
              setRestart(false);
            }}
            onDrag={(ratio) => {
              audioBuffer && setOffsetInSec(durationForSeekBar * ratio);
            }}
          />
        }
      />
    </div>
  );
};
