import styles from "./Tracks.module.css";
import { useCounter } from "@/counter";
import { useAtomValue } from "jotai";
import { enabledTracksAtom, tracksAtom } from "@/atoms";

export const Tracks = () => {
  useCounter("Tracks");
  const tracks = useAtomValue(tracksAtom);
  const enabledTracks = useAtomValue(enabledTracksAtom);
  return (
    <ul className={styles.tracks}>
      {tracks.map((track, i) => (
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
