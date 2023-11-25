import { useEffect, useRef, useState } from "react";
import { Display, DisplayApi } from "./Display";
import { PlayerControl } from "./PlayerControl";
import { useCounter } from "@/counter";
import { useAtom, useAtomValue } from "jotai";
import {
  audioBufferAtom,
  enabledTracksAtom,
  imageSizeAtom,
  imageUrlAtom,
  midiOffsetAtom,
  midiDataAtom,
  volumeAtom,
  rendererAtom,
  playingStateAtom,
  selectedRendererAtom,
  allRendererPropsAtom,
} from "@/atoms";
import { SeekBar } from "@/ui/SeekBar";
import { usePlayingTime } from "@/model/usePlayingTime";
import { PlayingState } from "@/model/types";

export const Player = () => {
  useCounter("Player");
  const midiOffsetInSec = useAtomValue(midiOffsetAtom);
  const imageUrl = useAtomValue(imageUrlAtom);
  const size = useAtomValue(imageSizeAtom);
  const midiData = useAtomValue(midiDataAtom);
  const enabledTracks = useAtomValue(enabledTracksAtom);
  const audioBuffer = useAtomValue(audioBufferAtom);
  const volume = useAtomValue(volumeAtom);
  const renderer = useAtomValue(rendererAtom);
  const selectedRenderer = useAtomValue(selectedRendererAtom);
  const allRendererProps = useAtomValue(allRendererPropsAtom);
  const [playingState, setPlayingState] = useAtom(playingStateAtom);
  const customProps = allRendererProps[selectedRenderer];
  const rendererModule = renderer.module;

  const mutables = {
    size,
    enabledTracks,
    customProps,
    rendererModule,
    midiOffsetInSec,
    volume,
  };
  const mutablesRef = useRef(mutables);
  mutablesRef.current = mutables;

  const [displayApi, setDisplayApi] = useState<DisplayApi | null>(null);
  const [audioBufferSource, setAudioBufferSource] =
    useState<AudioBufferSourceNode | null>(null);

  const [offsetInSec, setOffsetInSec] = useState(0);

  const handlePlay = () => {
    if (midiData == null) {
      return;
    }
    const ctx = new AudioContext();
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    if (audioBuffer) {
      source.connect(gain).connect(ctx.destination);
      const offset = offsetInSec;
      if (offset > 0) {
        source.start(0, offset);
      } else {
        source.start(-offset);
      }
      setAudioBufferSource(source);
    }
    const notes = midiData.notes;
    const startTime = performance.now();
    const timer = window.setInterval(() => {
      const display = displayApi!;
      const container = display.getContainer();
      const {
        size,
        enabledTracks,
        customProps,
        rendererModule,
        midiOffsetInSec,
        volume,
      } = mutablesRef.current;
      gain.gain.value = volume;
      const elapsedSec =
        offsetInSec + midiOffsetInSec + (performance.now() - startTime) / 1000;
      rendererModule?.update(container, {
        notes,
        size,
        enabledTracks,
        elapsedSec,
        customProps: customProps ?? {},
        playing: true,
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
      rendererModule == null
    ) {
      return;
    }
    const notes = midiData.notes;
    const display = displayApi;
    const svg = display.getContainer();
    const elapsedSec = offsetInSec + midiOffsetInSec;

    const container = displayApi.getContainer();
    container.innerHTML = "";
    rendererModule.init(container, { size, notes: midiData.notes });
    rendererModule.update(svg, {
      notes,
      size,
      enabledTracks,
      elapsedSec,
      customProps: customProps ?? {},
      playing: false,
    });
  }, [
    midiData,
    playingState,
    offsetInSec,
    midiOffsetInSec,
    enabledTracks,
    size,
    displayApi,
    rendererModule,
    customProps,
  ]);

  return (
    <div style={{ width: size.width, marginLeft: "auto", marginRight: "auto" }}>
      <Display onMount={setDisplayApi} size={size} imageUrl={imageUrl} />
      <SmartSeekBar
        playingState={playingState}
        offsetInSec={offsetInSec}
        duration={Math.max(audioBuffer?.duration ?? 0, midiData?.endSec ?? 0)}
        onPlay={handlePlay}
        onPause={handlePause}
        onChangeOffset={setOffsetInSec}
      />
      <PlayerControl
        playingState={playingState}
        onPlay={handlePlay}
        onPause={handlePause}
        onReturn={handleReturn}
        offsetInSec={offsetInSec}
      />
    </div>
  );
};

const SmartSeekBar = ({
  playingState,
  offsetInSec,
  duration,
  onPlay,
  onPause,
  onChangeOffset,
}: {
  playingState: PlayingState | null;
  offsetInSec: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onChangeOffset: (offsetInSec: number) => void;
}) => {
  const disabled = duration <= 0;
  const [restart, setRestart] = useState(false);
  const currentTimeInSec = usePlayingTime(playingState, 10);
  return (
    <SeekBar
      disabled={disabled}
      value={(offsetInSec + (currentTimeInSec ?? 0)) / duration}
      onStartDragging={(ratio) => {
        setRestart(currentTimeInSec != null);
        onPause();
        onChangeOffset(duration * ratio);
      }}
      onStopDragging={() => {
        if (restart) {
          onPlay();
        }
        setRestart(false);
      }}
      onDrag={(ratio) => {
        onChangeOffset(duration * ratio);
      }}
    />
  );
};
