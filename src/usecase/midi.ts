import { midiDataAtom, midiSpecificPropsAtom } from "@/usecase/atoms";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useMemo } from "react";
import { MidiData, MidiSpecificSettings } from "../domain/types";
import { useFileStorage } from "@/repository/fileStorage";
import { parseMidiData } from "@/domain/midi";

export const useMidiLoader = () => {
  const { status, save, data: midiFile } = useFileStorage("midi");
  const [midiData, setMidiData] = useAtom(midiDataAtom);
  useEffect(() => {
    if (midiFile) {
      const midiData = parseMidiData(midiFile.data);
      setMidiData({
        ...midiData,
        fileName: midiFile.name,
      });
    }
  }, [midiFile, setMidiData]);
  const loadMidi = (file: File) => {
    void (async () => {
      const buffer = await file.arrayBuffer();
      const midiData = parseMidiData(buffer);
      setMidiData({
        ...midiData,
        fileName: file.name,
      });
      await save({
        name: file.name,
        type: file.type,
        loadedAt: Date.now(),
        data: buffer,
      });
    })();
  };
  return {
    midiData,
    status,
    loadMidi,
  };
};

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
