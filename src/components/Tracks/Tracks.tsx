import styles from "./Tracks.module.css";
import { useCounter } from "@/counter";
import { useAtom, useAtomValue } from "jotai";
import { allTrackPropsAtom, midiDataAtom, selectedMidiFileAtom } from "@/atoms";

export const Tracks = () => {
  useCounter("Tracks");
  const midiData = useAtomValue(midiDataAtom);
  const selectedMidiFile = useAtomValue(selectedMidiFileAtom);
  const [allTrackProps, setAllTrackProps] = useAtom(allTrackPropsAtom);
  const setEnabled = (index: number, enabled: boolean) => {
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
        return {
          enabled: i === index ? enabled : trackProps[i]?.enabled ?? true,
        };
      }),
    });
  };
  return (
    <ul className={styles.tracks}>
      {(midiData?.tracks ?? []).map((track, i) => (
        <li key={i}>
          <label>
            <input
              type="checkbox"
              checked={
                (selectedMidiFile ? allTrackProps[selectedMidiFile] ?? [] : [])[
                  i
                ]?.enabled ?? true
              }
              onChange={(e) => {
                setEnabled(i, e.target.checked);
              }}
            />
            {track.number}. {track.name}
          </label>
        </li>
      ))}
    </ul>
  );
};
