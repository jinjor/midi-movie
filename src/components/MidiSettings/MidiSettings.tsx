import styles from "./MidiSettings.module.css";
import { useCounter } from "@/counter";
import { useCallback, useMemo } from "react";
import { MidiData, MidiSpecificSettings, Track } from "@/domain/types";
import { SortableList } from "@/ui/SortableList";
import { ControlLabel } from "@/ui/ControlLabel";
import { InputSlider } from "@/ui/InputSlider";
import { useMidiWithSettings } from "@/usecase/useMidiWithSettings";

export const MidiSettings = () => {
  useCounter("MidiSettings");
  const midi = useMidiWithSettings();
  if (midi == null) {
    return null;
  }
  const { midiData, settings, handleChangeMidiSettings } = midi;
  return (
    <div className={styles.settings}>
      <MidiSpecificParams
        settings={settings}
        onChangeMidiSettings={handleChangeMidiSettings}
      />
      <TrackList
        midiData={midiData}
        settings={settings}
        onChangeMidiSettings={handleChangeMidiSettings}
      />
    </div>
  );
};

const MidiSpecificParams = (props: {
  settings: MidiSpecificSettings;
  onChangeMidiSettings: (settings: MidiSpecificSettings) => void;
}) => {
  useCounter("MidiSpecificParams");
  const { settings, onChangeMidiSettings } = props;
  const handleMidiOffsetChange = useCallback(
    (midiOffsetInMilliSec: number) => {
      onChangeMidiSettings({
        ...settings,
        midiOffset: midiOffsetInMilliSec / 1000,
      });
    },
    [settings, onChangeMidiSettings],
  );
  const handleMinNoteChange = useCallback(
    (minNote: number) => {
      onChangeMidiSettings({
        ...settings,
        minNote,
      });
    },
    [settings, onChangeMidiSettings],
  );
  const handleMaxNoteChange = useCallback(
    (maxNote: number) => {
      onChangeMidiSettings({
        ...settings,
        maxNote,
      });
    },
    [settings, onChangeMidiSettings],
  );
  return (
    <div className={styles.settings}>
      <ControlLabel className={styles.settingsParam} text="Midi Offset(ms)">
        <InputSlider
          className={styles.inputSlider}
          min={-60000}
          max={60000}
          defaultValue={settings.midiOffset * 1000}
          onChange={handleMidiOffsetChange}
        />
      </ControlLabel>
      <ControlLabel className={styles.settingsParam} text="Min Note">
        <InputSlider
          className={styles.inputSlider}
          min={0}
          max={127}
          defaultValue={settings.minNote}
          onChange={handleMinNoteChange}
        />
      </ControlLabel>
      <ControlLabel className={styles.settingsParam} text="Max Note">
        <InputSlider
          className={styles.inputSlider}
          min={0}
          max={127}
          defaultValue={settings.maxNote}
          onChange={handleMaxNoteChange}
        />
      </ControlLabel>
    </div>
  );
};

const TrackList = (props: {
  midiData: MidiData;
  settings: MidiSpecificSettings;
  onChangeMidiSettings: (settings: MidiSpecificSettings) => void;
}) => {
  useCounter("TrackList");
  const { midiData, settings, onChangeMidiSettings } = props;

  const handleChangeTrackProps = useCallback(
    (trackProps: { order: number; enabled: boolean }[]) => {
      onChangeMidiSettings({
        ...settings,
        tracks: trackProps,
      });
    },
    [settings, onChangeMidiSettings],
  );

  const trackProps = useMemo(() => {
    const trackProps = [...settings.tracks];
    for (let i = trackProps.length; i < midiData.tracks.length; i++) {
      trackProps.push({
        order: i,
        enabled: true,
      });
    }
    return trackProps;
  }, [settings, midiData]);

  const sortedTracks = useMemo(() => {
    const sortedTracks = [...midiData.tracks];
    sortedTracks.sort((a, b) => {
      return trackProps[a.number - 1].order - trackProps[b.number - 1].order;
    });
    return sortedTracks;
  }, [midiData, trackProps]);

  const setEnabled = useCallback(
    (trackNumber: number, enabled: boolean) => {
      handleChangeTrackProps(
        sortedTracks.map((_, i) => {
          const props = trackProps[i] ?? {
            order: i,
            enabled: true,
          };
          return {
            ...props,
            enabled: i === trackNumber - 1 ? enabled : props.enabled,
          };
        }),
      );
    },
    [sortedTracks, trackProps, handleChangeTrackProps],
  );

  const handleSort = useCallback(
    (tracks: Track[]) => {
      handleChangeTrackProps(
        trackProps.map((props, i) => ({
          ...props,
          order: tracks.findIndex((track) => track.number === i + 1),
        })),
      );
    },
    [trackProps, handleChangeTrackProps],
  );
  return (
    <SortableList<Track>
      className={styles.tracks}
      onSort={handleSort}
      items={sortedTracks}
      getKey={(track) => track.number}
      renderItem={(track) => (
        <label>
          <input
            type="checkbox"
            checked={trackProps[track.number - 1].enabled}
            onChange={(e) => {
              setEnabled(track.number, e.target.checked);
            }}
          />
          {track.number}. {track.name}
        </label>
      )}
    />
  );
};
