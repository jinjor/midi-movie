import { useAtom, useAtomValue } from "jotai";
import { audioBufferAtom, volumeAtom } from "./atoms";
import { useCallback, useState } from "react";

export const useAudio = () => {
  const audioBuffer = useAtomValue(audioBufferAtom);
  const [audioBufferSource, setAudioBufferSource] =
    useState<AudioBufferSourceNode | null>(null);

  const playAudio = useCallback(
    (volume: number, offsetInSec: number) => {
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      const setVolume = (volume: number) => {
        gain.gain.value = volume;
      };
      setVolume(volume);

      if (audioBuffer && !audioBufferSource) {
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(gain).connect(ctx.destination);
        const offset = offsetInSec;
        if (offset > 0) {
          source.start(0, offset);
        } else {
          source.start(-offset);
        }
        setAudioBufferSource(source);
      }
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

export const useAudioSettings = () => {
  const [volume, setVolume] = useAtom(volumeAtom);
  return {
    volume,
    setVolume,
  };
};
