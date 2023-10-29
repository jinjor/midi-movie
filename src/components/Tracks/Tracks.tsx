import styles from "./Tracks.module.css";
import { useCounter } from "@/counter";
import { useAtomValue } from "jotai";
import { enabledTracksAtom, midiDataAtom } from "@/atoms";

export const Tracks = () => {
  useCounter("Tracks");
  const midiData = useAtomValue(midiDataAtom);
  const enabledTracks = useAtomValue(enabledTracksAtom);
  return (
    <ul className={styles.tracks}>
      {(midiData?.tracks ?? []).map((track, i) => (
        <li key={i}>
          <label>
            <input
              type="checkbox"
              defaultChecked={enabledTracks.has(i)}
              onChange={(e) => {
                e.target.checked
                  ? enabledTracks.add(i)
                  : enabledTracks.delete(i);
              }}
            />
            {track.number}. {track.name}
          </label>
        </li>
      ))}
    </ul>
  );
};
