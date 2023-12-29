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

const SortableList = <T,>(props: {
  className?: string;
  items: T[];
  onSort: (items: T[]) => void;
  getKey: (item: T) => string | number;
  renderItem: (item: T) => React.ReactNode;
}) => {
  useCounter("SortableList");
  const { className, items, onSort, getKey, renderItem } = props;
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLUListElement>(null);

  const temporarySortedItems = useMemo(() => {
    if (draggingIndex == null || dragOverIndex == null) {
      return items;
    }
    const newSortedTracks = [...items];
    newSortedTracks.splice(
      dragOverIndex,
      0,
      ...newSortedTracks.splice(draggingIndex, 1),
    );
    return newSortedTracks;
  }, [draggingIndex, dragOverIndex, items]);
  const handleMouseDown = useCallback((index: number) => {
    setDraggingIndex(index);
  }, []);
  const handleMouseUp = useCallback(() => {
    setDraggingIndex(null);
  }, []);
  const handleDragStart = useCallback(
    (e: React.DragEvent<unknown>, index: number) => {
      e.dataTransfer.dropEffect = "move";
      e.dataTransfer.effectAllowed = "move";
      setDraggingIndex(index);
    },
    [],
  );
  const handleDragEnter = useCallback((index: number) => {
    setDragOverIndex(index);
  }, []);
  const handleDragOver = useCallback(
    (e: React.DragEvent<unknown>, index: number) => {
      e.preventDefault();
      setDragOverIndex(index);
    },
    [],
  );
  const handleDrop = useCallback(
    (e: React.DragEvent<unknown>) => {
      e.stopPropagation();
      setDraggingIndex(null);
      setDragOverIndex(null);
      onSort(temporarySortedItems);
    },
    [temporarySortedItems, onSort],
  );
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (containerRef.current?.contains(e.target as Node)) {
        return;
      }
      setDragOverIndex(null);
    };
    const handleDragEnd = () => {
      setDraggingIndex(null);
      setDragOverIndex(null);
    };
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragend", handleDragEnd);
    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragend", handleDragEnd);
    };
  }, []);
  return (
    <ul
      className={className}
      ref={containerRef}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {temporarySortedItems.map((item, i) => (
        <li
          key={getKey(item)}
          onDragEnter={() => handleDragEnter(i)}
          onDragOver={(e) => handleDragOver(e, i)}
          style={{
            display: "flex",
            cursor: "move",
            outline:
              i === (dragOverIndex ?? draggingIndex)
                ? "1px solid #aaa"
                : "none",
            userSelect: "none",
          }}
        >
          <div style={{ width: 20, position: "relative", textAlign: "center" }}>
            <span>::</span>
            <div
              style={{
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                position: "absolute",
                opacity: 0,
                userSelect: "none",
              }}
              draggable
              onMouseDown={() => handleMouseDown(i)}
              onMouseUp={handleMouseUp}
              onDragStart={(e) => handleDragStart(e, i)}
            />
          </div>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
};
