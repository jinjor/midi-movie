import { useAtom } from "jotai";
import { playingStateAtom } from "./atoms";
import { useCallback, useEffect, useState } from "react";
import { PlayingState } from "@/domain/types";

export const usePlayer = () => {
  const [playingState, setPlayingState] = useAtom(playingStateAtom);
  const [offsetInSec, setOffsetInSec] = useState(0);

  const startPlaying = useCallback(
    (update: (currentTimeInSec: number) => void) => {
      const startTime = performance.now();
      const timer = window.setInterval(() => {
        const currentTimeInSec =
          offsetInSec + (performance.now() - startTime) / 1000;
        update(currentTimeInSec);
      }, 1000 / 60);
      setPlayingState({
        startTime,
        timer,
      });
    },
    [setPlayingState, offsetInSec],
  );
  const pausePlaying = useCallback(() => {
    if (playingState) {
      clearInterval(playingState.timer);
      setOffsetInSec(
        offsetInSec + (performance.now() - playingState.startTime) / 1000,
      );
      setPlayingState(null);
    }
  }, [playingState, setPlayingState, offsetInSec]);
  return {
    playingState,
    startPlaying,
    pausePlaying,
    offsetInSec,
    setOffsetInSec,
  };
};

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
