import { ReactNode } from "react";
import styles from "./PlayerControl.module.css";
import { formatTime } from "../../util";
import { useAtomValue } from "jotai";
import { currentTimeInSecAtom } from "@/atoms";

type Props = {
  onPlay: () => void;
  onPause: () => void;
  onReturn: () => void;
  isPlaying: boolean;
  offsetInSec: number;
  seekBar: ReactNode;
};

export const PlayerControl = ({
  isPlaying,
  onPlay,
  onPause,
  onReturn,
  seekBar,
  offsetInSec,
}: Props) => {
  const currentTimeInSec = useAtomValue(currentTimeInSecAtom);
  return (
    <div>
      {seekBar}
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
    </div>
  );
};
