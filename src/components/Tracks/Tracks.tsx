import { Mutables, Track } from "@/model/types";
import styles from "./Tracks.module.css";
import { useCounter } from "@/counter";

export const Tracks = ({
  tracks,
  mutablesRef,
}: {
  tracks: Track[];
  mutablesRef: React.MutableRefObject<Mutables>;
}) => {
  useCounter("Tracks");
  return (
    <ul className={styles.tracks}>
      {tracks.map((track, i) => (
        <li key={i}>
          <label>
            <input
              type="checkbox"
              defaultChecked={mutablesRef.current.enabledTracks.has(i)}
              onChange={(e) => {
                const enabledTracks = mutablesRef.current.enabledTracks;
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
