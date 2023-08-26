import { Track } from "./midi";

export const Tracks = ({
  tracks,
  enabledTracks,
  onChange,
}: {
  tracks: Track[];
  enabledTracks: boolean[];
  onChange: (enabledTracks: boolean[]) => void;
}) => {
  return (
    <ul className="tracks">
      {tracks.map((track, i) => (
        <li className="track" key={i}>
          <label>
            <input
              type="checkbox"
              checked={enabledTracks[i]}
              onChange={(e) => {
                const newEnabledTracks = [...enabledTracks];
                newEnabledTracks[i] = e.target.checked;
                onChange(newEnabledTracks);
              }}
            />
            {track.number}. {track.name}
          </label>
        </li>
      ))}
    </ul>
  );
};
