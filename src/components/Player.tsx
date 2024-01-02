import { useCallback, useEffect, useRef, useState } from "react";
import { Display, DisplayApi } from "./Display";
import { PlayerControl } from "./PlayerControl";
import { useCounter } from "@/counter";
import { useAtomValue } from "jotai";
import { imageSizeAtom, imageUrlAtom, volumeAtom } from "@/usecase/atoms";
import { SeekBar } from "@/ui/SeekBar";
import {
  MidiData,
  MidiSpecificSettings,
  PlayingState,
  Size,
} from "@/domain/types";
import { useMidiWithSettings } from "@/usecase/midi";
import { useRenderer } from "@/usecase/renderer";
import { RendererModule } from "@/domain/render";
import { useAudio } from "@/usecase/audio";
import { usePlayer, usePlayingTime } from "@/usecase/player";

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

  const { playAudio, pauseAudio, audioDuration } = useAudio();
  const volume = useAtomValue(volumeAtom);
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
    const { setVolume } = playAudio(volume, offsetInSec);
    let prevModule = rendererModule;
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
      rendererModule.update(container, {
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
    rendererModule,
    volume,
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
    rendererModule.init(container, {
      size,
      notes,
      customProps,
      ...midiOptions,
    });
    rendererModule.update(container, {
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
