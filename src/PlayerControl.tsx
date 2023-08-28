import { useEffect, useState } from "react";
import styles from "./PlayerControl.module.css";

type Props = {
  onPlay: () => void;
  onStop: () => void;
  isPlaying: boolean;
  startTime: number | null;
};

const formatTime = (timeInSec: number | null) => {
  if (timeInSec === null) {
    return "--:--";
  }
  const minutes = Math.floor(timeInSec / 60);
  const seconds = Math.floor(timeInSec % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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
      <div>{formatTime(currentTimeInSec)}</div>
    </div>
  );
};
