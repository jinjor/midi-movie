import { Mutables, Track } from "./model";
import styles from "./Tracks.module.css";

export const Tracks = ({
  tracks,
  mutablesRef,
}: {
  tracks: Track[];
  mutablesRef: React.MutableRefObject<Mutables>;
}) => {
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
