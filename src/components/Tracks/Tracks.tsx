import * as styles from "./Tracks.css.ts";
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
        <li key={i} className={styles.track}>
          <label className={styles.label}>
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
