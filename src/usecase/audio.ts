import { useAtomValue } from "jotai";
import { audioBufferAtom } from "./atoms";
import { useCallback, useState } from "react";

export const useAudio = () => {
  const audioBuffer = useAtomValue(audioBufferAtom);
  const [audioBufferSource, setAudioBufferSource] =
    useState<AudioBufferSourceNode | null>(null);

  const playAudio = useCallback(
    (volume: number, offsetInSec: number) => {
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.gain.value = volume;
      const setVolume = useCallback(
        (volume: number) => {
          gain.gain.value = volume;
        },
        [gain],
      );
      if (audioBufferSource == null) {
        return {
          setVolume,
        };
      }
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

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
      audioBufferSource.start();
      return {
        setVolume,
      };
    },
    [audioBufferSource, audioBuffer],
  );
  const pauseAudio = useCallback(() => {
    if (audioBufferSource) {
      audioBufferSource.stop();
      setAudioBufferSource(null);
    }
  }, [audioBufferSource]);
  return {
    playAudio,
    pauseAudio,
    audioDuration: audioBuffer?.duration ?? null,
  };
};
