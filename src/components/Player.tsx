import { useCallback, useEffect, useRef, useState } from "react";
import { Display, type DisplayApi } from "./Display";
import { PlayerControl } from "./PlayerControl";
import { useCounter } from "@/counter";
import { SeekBar } from "@/ui/SeekBar";
import type {
  MidiData,
  MidiSpecificSettings,
  PlayingState,
  Size,
} from "@/domain/types";
import { useMidiWithSettings } from "@/usecase/midi";
import { useRenderer } from "@/usecase/renderer";
import {
  useAudioPlayer,
  useAudioData,
  useAudioSettings,
} from "@/usecase/audio";
import { usePlayer, usePlayingTime } from "@/usecase/player";
import { useImageData } from "@/usecase/image";

const noop = () => {};

export const Player = () => {
  useCounter("Player");

  const { imageUrl, size } = useImageData();
  const midi = useMidiWithSettings();
  const [displayApi, setDisplayApi] = useState<DisplayApi | null>(null);

  useEffect(() => {
    if (displayApi == null) {
      return;
    }
    if (midi == null) {
      displayApi.getContainer().innerHTML = "";
    }
  }, [midi, displayApi]);

  return (
    <div style={{ width: size.width, marginLeft: "auto", marginRight: "auto" }}>
      <Display onMount={setDisplayApi} size={size} imageUrl={imageUrl} />
      {midi == null || displayApi == null ? (
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
  size: Size;
  displayApi: DisplayApi;
}) => {
  useCounter("PlayerInner");
  const { midiData, midiSettings, size, displayApi } = props;
  const { renderer, props: customProps } = useRenderer();
  const rendererModule = renderer?.module;
  const { audioBuffer } = useAudioData();
  const { playAudio, pauseAudio, audioDuration, setVolume } =
    useAudioPlayer(audioBuffer);
  const { volume } = useAudioSettings();
  const notes = midiData.notes;

  const {
    playingState,
    startPlaying,
    pausePlaying,
    offsetInSec,
    setOffsetInSec,
  } = usePlayer();

  const mutables = {
    size,
    customProps,
    rendererModule,
    midiSettings,
    volume,
  };
  const mutablesRef = useRef(mutables);
  mutablesRef.current = mutables;

  const handlePlay = useCallback(() => {
    setVolume(volume);
    playAudio(offsetInSec);
    let prevModule = mutablesRef.current.rendererModule;
    startPlaying((currentTimeInSec) => {
      const container = displayApi.getContainer();
      const {
        size,
        customProps,
        rendererModule,
        midiSettings: { midiOffset, ...midiProps },
        volume,
      } = mutablesRef.current;
      setVolume(volume);
      const elapsedSec = currentTimeInSec + midiOffset;
      if (rendererModule && prevModule !== rendererModule) {
        container.innerHTML = "";
        rendererModule.init(container, {
          size,
          notes,
          customProps,
          ...midiProps,
        });
      }
      rendererModule?.update(container, {
        notes,
        size,
        elapsedSec,
        customProps,
        playing: true,
        ...midiProps,
      });
      prevModule = rendererModule;
    });
  }, [
    playAudio,
    startPlaying,
    offsetInSec,
    notes,
    displayApi,
    volume,
    setVolume,
  ]);

  const handlePause = useCallback(() => {
    pauseAudio();
    pausePlaying();
  }, [pauseAudio, pausePlaying]);

  const handleReturn = useCallback(() => {
    handlePause();
    setOffsetInSec(0);
  }, [handlePause, setOffsetInSec]);

  useEffect(() => {
    if (playingState != null) {
      return;
    }
    const container = displayApi.getContainer();
    const { midiOffset, ...midiOptions } = midiSettings;
    const elapsedSec = offsetInSec + midiOffset;

    container.innerHTML = "";
    rendererModule?.init(container, {
      size,
      notes,
      customProps,
      ...midiOptions,
    });
    rendererModule?.update(container, {
      notes,
      size,
      elapsedSec,
      customProps,
      playing: false,
      ...midiOptions,
    });
  }, [
    notes,
    playingState,
    offsetInSec,
    midiSettings,
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
        duration={Math.max(audioDuration ?? 0, midiData.endSec ?? 0)}
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
