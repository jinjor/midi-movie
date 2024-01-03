import { useAtom, useAtomValue } from "jotai";
import { useRendererLoader } from "./renderer";
import { useCallback, useMemo } from "react";
import {
  audioBufferAtom,
  imageSizeAtom,
  imageUrlAtom,
  midiDataAtom,
  opacityAtom,
  selectedRendererAtom,
  volumeAtom,
} from "./atoms";
import { clear } from "@/repository/fileStorage";

export const useFileSettingsDeleter = () => {
  const [imageUrl, setImageUrl] = useAtom(imageUrlAtom);
  const [size, setSize] = useAtom(imageSizeAtom);
  const [midiData, setMidiData] = useAtom(midiDataAtom);
  const [audioBuffer, setAudioBuffer] = useAtom(audioBufferAtom);

  const hasFileSettings = useMemo(() => {
    return (
      imageUrl != null ||
      size != null ||
      midiData != null ||
      audioBuffer != null
    );
  }, [imageUrl, size, midiData, audioBuffer]);

  const deleteFileSettings = useCallback(() => {
    clear();
    setImageUrl(null);
    setSize(null);
    setMidiData(null);
    setAudioBuffer(null);
  }, [setImageUrl, setSize, setMidiData, setAudioBuffer]);

  return {
    hasFileSettings,
    deleteFileSettings,
  };
};

export const usePlayerSettingsDeleter = () => {
  const [volume, setVolume] = useAtom(volumeAtom);
  const [opacity, setOpacity] = useAtom(opacityAtom);
  const selectedRenderer = useAtomValue(selectedRendererAtom);
  const { selectRenderer } = useRendererLoader();

  const deletePlayerProps = useCallback(() => {
    setVolume(undefined);
    setOpacity(undefined);
    selectRenderer(undefined);
  }, [setVolume, setOpacity, selectRenderer]);

  const hasPlayerSettings = useMemo(() => {
    return volume != null || opacity != null || selectedRenderer != null;
  }, [volume, opacity, selectedRenderer]);

  return {
    hasPlayerSettings,
    deletePlayerProps,
  };
};
