import { midiDataAtom, midiSpecificPropsAtom } from "@/usecase/atoms";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useMemo } from "react";
import { MidiData, MidiSpecificSettings } from "../domain/types";

const defaultSettings: MidiSpecificSettings = {
  minNote: 0,
  maxNote: 127,
  midiOffset: 0,
  tracks: [],
};

export const useMidiWithSettings = () => {
  const midiData = useAtomValue(midiDataAtom);
  const midiSpecificProps = useAtomValue(midiSpecificPropsAtom);
  const settings = useMemo(() => {
    if (midiData == null) {
      return null;
    }
    const settings = midiSpecificProps[midiData.fileName] ?? defaultSettings;
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
  };
};

export const useMidiSettingsSetters = (
  midiData: MidiData,
  settings: MidiSpecificSettings,
) => {
  const [midiSpecificProps, setMidiSpecificProps] = useAtom(
    midiSpecificPropsAtom,
  );
  const setMidiSettings = useCallback(
    (newSettings: MidiSpecificSettings) => {
      setMidiSpecificProps({
        ...midiSpecificProps,
        [midiData.fileName]: newSettings,
      });
    },
    [midiSpecificProps, midiData, setMidiSpecificProps],
  );
  const setMidiOffsetChange = useCallback(
    (midiOffset: number) => {
      setMidiSettings({
        ...settings,
        midiOffset,
      });
    },
    [settings, setMidiSettings],
  );
  const setMinNoteChange = useCallback(
    (minNote: number) => {
      setMidiSettings({
        ...settings,
        minNote,
      });
    },
    [settings, setMidiSettings],
  );
  const setMaxNoteChange = useCallback(
    (maxNote: number) => {
      setMidiSettings({
        ...settings,
        maxNote,
      });
    },
    [settings, setMidiSettings],
  );
  const setTracks = useCallback(
    (tracks: { order: number; enabled: boolean }[]) => {
      setMidiSettings({
        ...settings,
        tracks,
      });
    },
    [settings, setMidiSettings],
  );
  return {
    setMidiOffsetChange,
    setMinNoteChange,
    setMaxNoteChange,
    setTracks,
  };
};
