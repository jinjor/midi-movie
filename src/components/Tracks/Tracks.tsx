import styles from "./Tracks.module.css";
import { useCounter } from "@/counter";
import { useAtom, useAtomValue } from "jotai";
import { allTrackPropsAtom, midiDataAtom, selectedMidiFileAtom } from "@/atoms";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Track } from "@/model/types";

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

export const TrackList = (props: {
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
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLUListElement>(null);

  const temporarySortedTracks = useMemo(() => {
    if (draggingIndex == null || dragOverIndex == null) {
      return sortedTracks;
    }
    const newSortedTracks = [...sortedTracks];
    newSortedTracks.splice(
      dragOverIndex,
      0,
      ...newSortedTracks.splice(draggingIndex, 1),
    );
    return newSortedTracks;
  }, [draggingIndex, dragOverIndex, sortedTracks]);

  const setEnabled = (trackNumber: number, enabled: boolean) => {
    onChangeTrackProps(
      temporarySortedTracks.map((_, i) => {
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
  const handleDragStart = useCallback(
    (e: React.DragEvent<unknown>, index: number) => {
      (e.target as HTMLElement).style.opacity = "0";
      e.dataTransfer.dropEffect = "none";
      e.dataTransfer.effectAllowed = "none";
      setDraggingIndex(index);
    },
    [],
  );
  const handleDragEnter = useCallback((index: number) => {
    setDragOverIndex(index);
  }, []);
  const handleDragOver = useCallback(
    (e: React.DragEvent<unknown>, index: number) => {
      e.stopPropagation();
      e.preventDefault();
      setDragOverIndex(index);
    },
    [],
  );
  const handleDragEnd = useCallback(
    (e: React.DragEvent<unknown>) => {
      e.stopPropagation();
      setDraggingIndex(null);
      setDragOverIndex(null);
      onChangeTrackProps(
        trackProps.map((props, i) => ({
          ...props,
          order: temporarySortedTracks.findIndex(
            (track) => track.number === i + 1,
          ),
        })),
      );
    },
    [trackProps, temporarySortedTracks, onChangeTrackProps],
  );
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      if (containerRef.current?.contains(e.target as Node)) {
        return;
      }
      setDragOverIndex(null);
    };
    document.addEventListener("dragover", handleDragOver);
    return () => {
      document.removeEventListener("dragover", handleDragOver);
    };
  }, []);
  return (
    <ul className={styles.tracks} ref={containerRef} onDragEnd={handleDragEnd}>
      {temporarySortedTracks.map((track, i) => (
        <li
          key={track.number}
          onDragEnter={() => handleDragEnter(i)}
          onDragOver={(e) => handleDragOver(e, i)}
          style={{ display: "flex", cursor: "move" }}
        >
          <div style={{ width: 20, position: "relative" }}>
            <span>::</span>
            <div
              style={{
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                position: "absolute",
              }}
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
            />
          </div>
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
        </li>
      ))}
    </ul>
  );
};
