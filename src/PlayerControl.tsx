import { useEffect, useState } from "react";
import styles from "./PlayerControl.module.css";
import { formatTime } from "./util";

type Props = {
  onPlay: () => void;
  onStop: () => void;
  isPlaying: boolean;
  startTime: number | null;
};

export const PlayerControl = ({
  isPlaying,
  onPlay,
  onStop,
  startTime,
}: Props) => {
  const [currentTimeInSec, setCurrentTimeInSec] = useState<number | null>(null);
  useEffect(() => {
    if (startTime === null) {
      setCurrentTimeInSec(null);
      return;
    }
    const timer = setInterval(() => {
      setCurrentTimeInSec(Math.floor((performance.now() - startTime) / 1000));
    }, 1000 / 10);
    return () => clearInterval(timer);
  }, [startTime]);
  return (
    <div className={styles.controls}>
      <div>
        {isPlaying ? (
          <button onClick={onStop}>Stop</button>
        ) : (
          <button onClick={onPlay}>Play</button>
        )}
      </div>
      <div>
        {currentTimeInSec == null ? "--:--" : formatTime(currentTimeInSec)}
      </div>
    </div>
  );
};
