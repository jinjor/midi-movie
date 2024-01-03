import { useAtom } from "jotai";
import { audioBufferAtom, volumeAtom } from "./atoms";
import { useCallback, useEffect, useState } from "react";
import { useFileStorage } from "@/repository/fileStorage";

export const useAudioData = () => {
  const [audioBuffer, setAudioBuffer] = useAtom(audioBufferAtom);
  return {
    audioBuffer,
    setAudioBuffer,
  };
};

export const useAudioLoader = () => {
  const { audioBuffer, setAudioBuffer } = useAudioData();
  const [name, setName] = useState("");
  const { status, save, data: audioFile } = useFileStorage("audio");
  useEffect(() => {
    if (audioFile) {
      void (async () => {
        const arrayBuffer = audioFile.data;
        const ctx = new AudioContext();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        setName(audioFile.name);
        setAudioBuffer(audioBuffer);
      })();
    }
  }, [audioFile, setAudioBuffer]);
  const loadAudio = (file: File) => {
    void (async () => {
      const arrayBuffer = await file.arrayBuffer();
      await save({
        name: file.name,
        type: file.type,
        loadedAt: Date.now(),
        data: arrayBuffer,
      });
      const ctx = new AudioContext();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      setName(file.name);
      setAudioBuffer(audioBuffer);
    })();
  };
  return {
    audioBuffer,
    name,
    status,
    loadAudio,
  };
};

export const useAudioSettings = () => {
  const [volume = 1, setVolume] = useAtom(volumeAtom);
  return {
    volume,
    setVolume,
  };
};

export const useAudioPlayer = (audioBuffer: AudioBuffer | null) => {
  const ctx = new AudioContext();
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  const setVolume = useCallback(
    (volume: number) => {
      gain.gain.value = volume;
    },
    [gain],
  );
  const [audioBufferSource, setAudioBufferSource] =
    useState<AudioBufferSourceNode | null>(null);

  const playAudio = useCallback(
    (offsetInSec: number) => {
      if (audioBuffer && audioBufferSource == null) {
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(gain);
        const offset = offsetInSec;
        if (offset > 0) {
          source.start(0, offset);
        } else {
          source.start(-offset);
        }
        setAudioBufferSource(source);
      }
    },
    [audioBufferSource, audioBuffer, ctx, gain],
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
    setVolume,
  };
};
