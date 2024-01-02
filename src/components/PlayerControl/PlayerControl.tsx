import styles from "./PlayerControl.module.css";
import { formatTime } from "../../util";
import { PlayingState } from "@/domain/types";
import { usePlayingTime } from "@/usecase/usePlayingTime";

type Props = {
  onPlay: () => void;
  onPause: () => void;
  onReturn: () => void;
  playingState: PlayingState | null;
  offsetInSec: number;
};

export const PlayerControl = ({
  playingState,
  offsetInSec,
  onPlay,
  onPause,
  onReturn,
}: Props) => {
  const isPlaying = playingState != null;
  const currentTimeInSec = usePlayingTime(playingState);
  return (
    <div className={styles.controls}>
      <div>
        <button onClick={onReturn}>Return</button>
        {isPlaying ? (
          <button onClick={onPause}>Pause</button>
        ) : (
          <button onClick={onPlay}>Play</button>
        )}
      </div>
      <div>{formatTime(offsetInSec + (currentTimeInSec ?? 0))}</div>
    </div>
  );
};
