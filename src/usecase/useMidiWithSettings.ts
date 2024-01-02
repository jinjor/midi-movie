import { midiDataAtom, midiSpecificPropsAtom } from "@/usecase/atoms";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useMemo } from "react";
import { MidiSpecificSettings } from "../domain/types";

export const useMidiWithSettings = () => {
  const midiData = useAtomValue(midiDataAtom);
  const [midiSpecificProps, setMidiSpecificProps] = useAtom(
    midiSpecificPropsAtom,
  );
  const handleChangeMidiSettings = useCallback(
    (newSettings: MidiSpecificSettings) => {
      if (midiData == null) {
        return;
      }
      setMidiSpecificProps({
        ...midiSpecificProps,
        [midiData.fileName]: newSettings,
      });
    },
    [midiSpecificProps, midiData, setMidiSpecificProps],
  );
  const settings = useMemo(() => {
    if (midiData == null) {
      return null;
    }
    const settings = midiSpecificProps[midiData.fileName] ?? {
      minNote: 0,
      maxNote: 127,
      midiOffset: 0,
      tracks: [],
    };
    const tracks = [...settings.tracks];
    for (let i = tracks.length; i < midiData.tracks.length; i++) {
      tracks.push({
        order: i,
        enabled: true,
      });
    }
    return {
      ...settings,
      tracks,
    };
  }, [midiSpecificProps, midiData]);
  if (midiData == null || settings == null) {
    return null;
  }
  return {
    midiData,
    settings,
    handleChangeMidiSettings,
  };
};
