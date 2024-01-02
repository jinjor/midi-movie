import styles from "./MidiSettings.module.css";
import { useCounter } from "@/counter";
import { useAtom, useAtomValue } from "jotai";
import { midiSpecificPropsAtom, midiDataAtom } from "@/atoms";
import { useCallback } from "react";
import { Track } from "@/model/types";
import { SortableList } from "@/ui/SortableList";
import { ControlLabel } from "@/ui/ControlLabel";
import { InputSlider } from "@/ui/InputSlider";

export const MidiSettings = () => {
  useCounter("MidiSettings");
  const midiData = useAtomValue(midiDataAtom);
  const [midiSpecificProps, setMidiSpecificProps] = useAtom(
    midiSpecificPropsAtom,
  );

  const handleChangeTrackProps = useCallback(
    (trackProps: { order: number; enabled: boolean }[]) => {
      if (midiData == null) {
        return;
      }
      const settings = midiSpecificProps[midiData.fileName] ?? {
        minNote: 0,
        maxNote: 127,
        tracks: [],
      };
      setMidiSpecificProps({
        ...midiSpecificProps,
        [midiData.fileName]: {
          ...settings,
          tracks: trackProps,
        },
      });
    },
    [midiSpecificProps, midiData, setMidiSpecificProps],
  );
  const handleMidiOffsetInSecChange = useCallback(
    (midiOffsetInSec: number) => {
      if (midiData == null) {
        return;
      }
      const settings = midiSpecificProps[midiData.fileName] ?? {
        minNote: 0,
        maxNote: 127,
        tracks: [],
      };
      setMidiSpecificProps({
        ...midiSpecificProps,
        [midiData.fileName]: {
          ...settings,
          midiOffset: midiOffsetInSec,
        },
      });
    },
    [midiSpecificProps, midiData, setMidiSpecificProps],
  );
  const handleMinNoteChange = useCallback(
    (minNote: number) => {
      if (midiData == null) {
        return;
      }
      const settings = midiSpecificProps[midiData.fileName] ?? {
        minNote: 0,
        maxNote: 127,
        tracks: [],
      };
      setMidiSpecificProps({
        ...midiSpecificProps,
        [midiData.fileName]: {
          ...settings,
          minNote,
        },
      });
    },
    [midiSpecificProps, midiData, setMidiSpecificProps],
  );
  const handleMaxNoteChange = useCallback(
    (maxNote: number) => {
      if (midiData == null) {
        return;
      }
      const settings = midiSpecificProps[midiData.fileName] ?? {
        minNote: 0,
        maxNote: 127,
        tracks: [],
      };
      setMidiSpecificProps({
        ...midiSpecificProps,
        [midiData.fileName]: {
          ...settings,
          maxNote,
        },
      });
    },
    [midiSpecificProps, midiData, setMidiSpecificProps],
  );

  if (midiData == null) {
    return null;
  }
  const settings = midiSpecificProps[midiData.fileName] ?? {
    minNote: 0,
    maxNote: 127,
    midiOffset: 0,
    tracks: [],
  };
  const { minNote, maxNote, midiOffset, tracks: trackProps } = settings;
  for (let i = trackProps.length; i < midiData.tracks.length; i++) {
    trackProps.push({
      order: i,
      enabled: true,
    });
  }

  const sortedTracks = [...midiData.tracks];
  sortedTracks.sort((a, b) => {
    return trackProps[a.number - 1].order - trackProps[b.number - 1].order;
  });

  return (
    <div className={styles.settings}>
      <MidiSpecificParams
        minNote={minNote}
        maxNote={maxNote}
        midiOffsetInSec={midiOffset}
        onMinNoteChange={handleMinNoteChange}
        onMaxNoteChange={handleMaxNoteChange}
        onMidiOffsetInSecChange={handleMidiOffsetInSecChange}
      />
      <TrackList
        trackProps={trackProps}
        sortedTracks={sortedTracks}
        onChangeTrackProps={handleChangeTrackProps}
      />
    </div>
  );
};

const MidiSpecificParams = (props: {
  midiOffsetInSec: number;
  minNote: number;
  maxNote: number;
  onMinNoteChange: (minNote: number) => void;
  onMaxNoteChange: (maxNote: number) => void;
  onMidiOffsetInSecChange: (midiOffsetInSec: number) => void;
}) => {
  useCounter("MidiSpecificParams");
  const {
    midiOffsetInSec,
    minNote,
    maxNote,
    onMinNoteChange,
    onMaxNoteChange,
    onMidiOffsetInSecChange,
  } = props;
  const handleMidiOffsetChange = (midiOffsetInMilliSec: number) => {
    onMidiOffsetInSecChange(midiOffsetInMilliSec / 1000);
  };
  return (
    <div className={styles.settings}>
      <ControlLabel className={styles.settingsParam} text="Midi Offset(ms)">
        <InputSlider
          className={styles.inputSlider}
          min={-60000}
          max={60000}
          defaultValue={midiOffsetInSec * 1000}
          onChange={handleMidiOffsetChange}
        />
      </ControlLabel>
      <ControlLabel className={styles.settingsParam} text="Min Note">
        <InputSlider
          className={styles.inputSlider}
          min={0}
          max={127}
          defaultValue={minNote}
          onChange={onMinNoteChange}
        />
      </ControlLabel>
      <ControlLabel className={styles.settingsParam} text="Max Note">
        <InputSlider
          className={styles.inputSlider}
          min={0}
          max={127}
          defaultValue={maxNote}
          onChange={onMaxNoteChange}
        />
      </ControlLabel>
    </div>
  );
};

const TrackList = (props: {
  trackProps: {
    order: number;
    enabled: boolean;
  }[];
  sortedTracks: Track[];
  onChangeTrackProps: (
    trackProps: {
      order: number;
      enabled: boolean;
    }[],
  ) => void;
}) => {
  useCounter("TrackList");
  const { trackProps, sortedTracks, onChangeTrackProps } = props;
  const setEnabled = (trackNumber: number, enabled: boolean) => {
    onChangeTrackProps(
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
  };

  const handleSort = useCallback(
    (tracks: Track[]) => {
      onChangeTrackProps(
        trackProps.map((props, i) => ({
          ...props,
          order: tracks.findIndex((track) => track.number === i + 1),
        })),
      );
    },
    [trackProps, onChangeTrackProps],
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
