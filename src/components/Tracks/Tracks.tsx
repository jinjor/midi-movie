import styles from "./Tracks.module.css";
import { useCounter } from "@/counter";
import { useAtom, useAtomValue } from "jotai";
import { allTrackPropsAtom, midiDataAtom, selectedMidiFileAtom } from "@/atoms";
import { useCallback } from "react";
import { Track } from "@/model/types";
import { SortableList } from "@/ui/SortableList";

export const Tracks = () => {
  useCounter("Tracks");
  const midiData = useAtomValue(midiDataAtom);
  const selectedMidiFile = useAtomValue(selectedMidiFileAtom);
  const [allTrackProps, setAllTrackProps] = useAtom(allTrackPropsAtom);
  const handleChangeTrackProps = useCallback(
    (trackProps: { order: number; enabled: boolean }[]) => {
      if (selectedMidiFile == null) {
        return;
      }
      setAllTrackProps({
        ...allTrackProps,
        [selectedMidiFile]: trackProps,
      });
    },
    [allTrackProps, selectedMidiFile, setAllTrackProps],
  );
  if (!midiData || !selectedMidiFile) {
    return null;
  }

  const trackProps = allTrackProps[selectedMidiFile] ?? [];
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
    <TrackList
      trackProps={trackProps}
      sortedTracks={sortedTracks}
      onChangeTrackProps={handleChangeTrackProps}
    />
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
