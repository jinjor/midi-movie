import styles from "./Tracks.module.css";
import { useCounter } from "@/counter";
import { useAtom, useAtomValue } from "jotai";
import { enabledTracksAtom, midiDataAtom } from "@/atoms";

export const Tracks = () => {
  useCounter("Tracks");
  const midiData = useAtomValue(midiDataAtom);
  const [enabledTracks, setEnabledTracks] = useAtom(enabledTracksAtom);
  return (
    <ul className={styles.tracks}>
      {(midiData?.tracks ?? []).map((track, i) => (
        <li key={i}>
          <label>
            <input
              type="checkbox"
              defaultChecked={enabledTracks[i]}
              onChange={(e) => {
                setEnabledTracks(
                  enabledTracks.map((enabled, index) =>
                    index === i ? e.target.checked : enabled,
                  ),
                );
              }}
            />
            {track.number}. {track.name}
          </label>
        </li>
      ))}
    </ul>
  );
};
