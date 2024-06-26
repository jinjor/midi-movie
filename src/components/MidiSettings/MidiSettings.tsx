import styles from "./MidiSettings.module.css";
import { useCounter } from "@/counter";
import { useCallback, useMemo } from "react";
import type { MidiData, MidiSpecificSettings, Track } from "@/domain/types";
import { SortableList } from "@/ui/SortableList";
import { ControlLabel } from "@/ui/ControlLabel";
import { InputSlider } from "@/ui/InputSlider";
import { useMidiSettingsSetters, useMidiWithSettings } from "@/usecase/midi";

export const MidiSettings = () => {
  useCounter("MidiSettings");
  const midi = useMidiWithSettings();
  if (midi == null) {
    return null;
  }
  const { midiData, settings } = midi;
  return (
    <div className={styles.settings}>
      <MidiSpecificParams midiData={midiData} settings={settings} />
      <TrackList midiData={midiData} settings={settings} />
    </div>
  );
};

const MidiSpecificParams = (props: {
  midiData: MidiData;
  settings: MidiSpecificSettings;
}) => {
  useCounter("MidiSpecificParams");
  const { midiData, settings } = props;
  const { setMinNoteChange, setMaxNoteChange, setMidiOffsetChange } =
    useMidiSettingsSetters(midiData, settings);
  const handleMidiOffsetChange = useCallback(
    (midiOffsetInMilliSec: number) => {
      setMidiOffsetChange(midiOffsetInMilliSec / 1000);
    },
    [setMidiOffsetChange],
  );
  return (
    <div className={styles.settings}>
      <ControlLabel className={styles.settingsParam} text="Midi Offset(ms)">
        <InputSlider
          className={styles.inputSlider}
          min={-60000}
          max={60000}
          value={settings.midiOffset * 1000}
          onChange={handleMidiOffsetChange}
        />
      </ControlLabel>
      <ControlLabel className={styles.settingsParam} text="Min Note">
        <InputSlider
          className={styles.inputSlider}
          min={0}
          max={127}
          value={settings.minNote}
          onChange={setMinNoteChange}
        />
      </ControlLabel>
      <ControlLabel className={styles.settingsParam} text="Max Note">
        <InputSlider
          className={styles.inputSlider}
          min={0}
          max={127}
          value={settings.maxNote}
          onChange={setMaxNoteChange}
        />
      </ControlLabel>
    </div>
  );
};

const TrackList = (props: {
  midiData: MidiData;
  settings: MidiSpecificSettings;
}) => {
  useCounter("TrackList");
  const { midiData, settings } = props;
  const { setTrackEnabled, setOrders } = useMidiSettingsSetters(
    midiData,
    settings,
  );
  const trackProps = settings.tracks;

  const sortedTracks = useMemo(() => {
    const sortedTracks = [...midiData.tracks];
    sortedTracks.sort((a, b) => {
      return trackProps[a.number - 1].order - trackProps[b.number - 1].order;
    });
    return sortedTracks;
  }, [midiData, trackProps]);

  const handleSort = useCallback(
    (tracks: Track[]) => {
      setOrders((i) => tracks.findIndex((track) => track.number === i + 1));
    },
    [setOrders],
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
              setTrackEnabled(track.number, e.target.checked);
            }}
          />
          {track.number}. {track.name}
        </label>
      )}
    />
  );
};
