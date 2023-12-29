import styles from "./Tracks.module.css";
import { useCounter } from "@/counter";
import { useAtom, useAtomValue } from "jotai";
import { allTrackPropsAtom, midiDataAtom, selectedMidiFileAtom } from "@/atoms";
import { useCallback, useEffect, useState } from "react";

export const Tracks = () => {
  useCounter("Tracks");
  const midiData = useAtomValue(midiDataAtom);
  const selectedMidiFile = useAtomValue(selectedMidiFileAtom);
  const [allTrackProps, setAllTrackProps] = useAtom(allTrackPropsAtom);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const getTrackProps = useCallback(() => {
    const trackLength = midiData?.tracks.length ?? 0;
    const trackProps = [
      ...(selectedMidiFile != null
        ? allTrackProps[selectedMidiFile] ?? []
        : []),
    ];
    for (let i = trackProps.length; i < trackLength; i++) {
      trackProps.push({
        order: i,
        enabled: true,
      });
    }
    return trackProps;
  }, [selectedMidiFile, allTrackProps, midiData]);
  const getSortedTracks = useCallback(
    (trackProps: ReturnType<typeof getTrackProps>) => {
      const tracks = [...(midiData?.tracks ?? [])];
      tracks.sort((a, b) => {
        return trackProps[a.number - 1].order - trackProps[b.number - 1].order;
      });
      return tracks;
    },
    [midiData, getTrackProps],
  );

  const setEnabled = (trackNumber: number, enabled: boolean) => {
    const tracks = midiData?.tracks ?? [];
    if (tracks.length === 0) {
      return;
    }
    if (selectedMidiFile == null) {
      return;
    }
    const trackProps = allTrackProps[selectedMidiFile] ?? [];
    setAllTrackProps({
      ...allTrackProps,
      [selectedMidiFile]: tracks.map((_, i) => {
        const props = trackProps[i] ?? {
          order: i,
          enabled: true,
        };
        return {
          ...props,
          enabled: i === trackNumber - 1 ? enabled : props.enabled,
        };
      }),
    });
  };
  const handleDragStart = useCallback((index: number) => {
    setDraggingIndex(index);
  }, []);
  const handleDragEnter = useCallback((index: number) => {
    setDragOverIndex(index);
  }, []);
  const handleDragEnd = useCallback(() => {
    setDraggingIndex(null);
    setDragOverIndex(null);
    if (selectedMidiFile == null) {
      return;
    }
    const trackProps = getTrackProps();
    const tracks = getSortedTracks(trackProps);
    setAllTrackProps({
      ...allTrackProps,
      [selectedMidiFile]: getTrackProps().map((props, i) => ({
        ...props,
        order: tracks.findIndex((track) => track.number === i + 1),
      })),
    });
  }, [
    selectedMidiFile,
    allTrackProps,
    setAllTrackProps,
    getTrackProps,
    getSortedTracks,
  ]);
  console.log(draggingIndex, dragOverIndex);
  // useEffect(() => {
  //   const handleCancel = () => {
  //     setDraggingIndex(null);
  //     setDragOverIndex(null);
  //   };
  //   document.addEventListener("dragend", handleCancel);
  //   document.addEventListener("dragleave", handleCancel);
  //   document.addEventListener("dragover", handleCancel);
  //   document.addEventListener("drop", handleCancel);
  //   return () => {
  //     document.removeEventListener("dragend", handleCancel);
  //     document.removeEventListener("dragleave", handleCancel);
  //     document.removeEventListener("dragover", handleCancel);
  //     document.removeEventListener("drop", handleCancel);
  //   };
  // }, []);
  const trackProps = getTrackProps();
  const tracks = getSortedTracks(trackProps);
  return (
    <ul className={styles.tracks}>
      {tracks.map((track, i) => (
        <li
          key={track.number}
          draggable
          onDragStart={() => handleDragStart(i)}
          onDragEnter={() => handleDragEnter(i)}
          onDragEnd={() => handleDragEnd()}
        >
          <label>
            <input
              type="checkbox"
              checked={
                (selectedMidiFile ? allTrackProps[selectedMidiFile] ?? [] : [])[
                  i
                ]?.enabled ?? true
              }
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
