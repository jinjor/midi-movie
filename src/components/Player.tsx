import { useEffect, useRef, useState } from "react";
import { Display, DisplayApi } from "./Display";
import { PlayerControl } from "./PlayerControl";
import { useCounter } from "@/counter";
import { useAtom, useAtomValue } from "jotai";
import {
  audioBufferAtom,
  imageSizeAtom,
  imageUrlAtom,
  volumeAtom,
  playingStateAtom,
} from "@/usecase/atoms";
import { SeekBar } from "@/ui/SeekBar";
import { usePlayingTime } from "@/usecase/usePlayingTime";
import {
  MidiData,
  MidiSpecificSettings,
  PlayingState,
  Size,
} from "@/domain/types";
import { useMidiWithSettings } from "@/usecase/midiSettings";
import { useRenderer } from "@/usecase/renderer";
import { RendererModule } from "@/domain/render";

const noop = () => {};

export const Player = () => {
  useCounter("Player");

  const imageUrl = useAtomValue(imageUrlAtom);
  const size = useAtomValue(imageSizeAtom);
  const midi = useMidiWithSettings();
  const { renderer, customProps } = useRenderer();
  const [displayApi, setDisplayApi] = useState<DisplayApi | null>(null);

  return (
    <div style={{ width: size.width, marginLeft: "auto", marginRight: "auto" }}>
      <Display onMount={setDisplayApi} size={size} imageUrl={imageUrl} />
      {midi == null || displayApi == null || renderer.module == null ? (
        <>
          <SmartSeekBar
            playingState={null}
            offsetInSec={0}
            duration={0}
            onPlay={noop}
            onPause={noop}
            onChangeOffset={noop}
          />
          <PlayerControl
            playingState={null}
            onPlay={noop}
            onPause={noop}
            onReturn={noop}
            offsetInSec={0}
          />
        </>
      ) : (
        <PlayerInner
          midiData={midi.midiData}
          midiSettings={midi.settings}
          rendererModule={renderer.module}
          customProps={customProps}
          size={size}
          displayApi={displayApi}
        />
      )}
    </div>
  );
};

const PlayerInner = (props: {
  midiData: MidiData;
  midiSettings: MidiSpecificSettings;
  rendererModule: RendererModule;
  customProps: Record<string, number>;
  size: Size;
  displayApi: DisplayApi;
}) => {
  useCounter("PlayerInner");
  const {
    midiData,
    midiSettings,
    rendererModule,
    customProps,
    size,
    displayApi,
  } = props;

  const audioBuffer = useAtomValue(audioBufferAtom);
  const volume = useAtomValue(volumeAtom);

  const [playingState, setPlayingState] = useAtom(playingStateAtom);
  const trackProps = midiSettings.tracks;

  const mutables = {
    size,
    trackProps,
    customProps,
    rendererModule,
    minNote: midiSettings.minNote,
    maxNote: midiSettings.maxNote,
    midiOffsetInSec: midiSettings.midiOffset,
    volume,
  };
  const mutablesRef = useRef(mutables);
  mutablesRef.current = mutables;

  const [audioBufferSource, setAudioBufferSource] =
    useState<AudioBufferSourceNode | null>(null);

  const [offsetInSec, setOffsetInSec] = useState(0);

  const handlePlay = () => {
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
    let prevModule = rendererModule;
    const timer = window.setInterval(() => {
      const container = displayApi.getContainer();
      const {
        size,
        minNote,
        maxNote,
        trackProps,
        customProps,
        rendererModule,
        midiOffsetInSec,
        volume,
      } = mutablesRef.current;
      gain.gain.value = volume;
      const elapsedSec =
        offsetInSec + midiOffsetInSec + (performance.now() - startTime) / 1000;
      if (rendererModule && prevModule !== rendererModule) {
        container.innerHTML = "";
        rendererModule.init(container, {
          size,
          notes: midiData.notes,
          minNote,
          maxNote,
          tracks: trackProps,
          customProps,
        });
      }
      rendererModule.update(container, {
        notes,
        size,
        minNote,
        maxNote,
        tracks: trackProps,
        elapsedSec,
        customProps,
        playing: true,
      });
      prevModule = rendererModule;
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
    if (playingState != null) {
      return;
    }
    const notes = midiData.notes;
    const container = displayApi.getContainer();
    const elapsedSec = offsetInSec + midiSettings.midiOffset;

    container.innerHTML = "";
    rendererModule.init(container, {
      size,
      minNote: midiSettings.minNote,
      maxNote: midiSettings.maxNote,
      notes: midiData.notes,
      tracks: trackProps,
      customProps,
    });
    rendererModule.update(container, {
      notes,
      size,
      minNote: midiSettings.minNote,
      maxNote: midiSettings.maxNote,
      tracks: trackProps,
      elapsedSec,
      customProps,
      playing: false,
    });
  }, [
    midiData,
    playingState,
    offsetInSec,
    midiSettings.minNote,
    midiSettings.maxNote,
    midiSettings.midiOffset,
    trackProps,
    size,
    displayApi,
    rendererModule,
    customProps,
  ]);

  return (
    <>
      <SmartSeekBar
        playingState={playingState}
        offsetInSec={offsetInSec}
        duration={Math.max(audioBuffer?.duration ?? 0, midiData.endSec ?? 0)}
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
    </>
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
