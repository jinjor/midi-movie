import { useAtom, useAtomValue } from "jotai";
import { useRendererLoader } from "./renderer";
import { useCallback, useMemo } from "react";
import { opacityAtom, selectedRendererAtom, volumeAtom } from "./atoms";

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
