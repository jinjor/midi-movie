import { useEffect, useState } from "react";
import { PlayingState } from "./types";

export const usePlayingTime = (
  playingState: PlayingState | null,
  updatesPerSecond = 1,
) => {
  const [currentTimeInSec, setCurrentTimeInSec] = useState<number | null>(null);
  useEffect(() => {
    if (playingState === null) {
      setCurrentTimeInSec(null);
      return;
    }
    const timer = setInterval(() => {
      setCurrentTimeInSec(
        Math.floor(
          ((performance.now() - playingState.startTime) / 1000) *
            updatesPerSecond,
        ) / updatesPerSecond,
      );
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [playingState, updatesPerSecond]);

  return currentTimeInSec;
};
