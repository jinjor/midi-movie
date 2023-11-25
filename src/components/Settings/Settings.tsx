import { useCounter } from "@/counter";
import { useAtom } from "jotai";
import { midiOffsetAtom, volumeAtom } from "@/atoms";
import { NumberInput } from "@/ui/NumberInput";
import { Tracks } from "../Tracks";
import { ImageLoader } from "../ImageLoader";
import { AudioLoader } from "../AudioLoader";

import styles from "./Settings.module.css";

export const Settings = () => {
  useCounter("Settings");
  const [midiOffsetInSec, setMidiOffsetInSec] = useAtom(midiOffsetAtom);
  const [volume, setVolume] = useAtom(volumeAtom);
  const handleMidiOffsetChange = (midiOffsetInMilliSec: number) => {
    setMidiOffsetInSec(midiOffsetInMilliSec / 1000);
  };
  const handleVolumeChange = (volume: number) => {
    setVolume(volume);
  };
  return (
    <div className={styles.settings}>
      <ImageLoader />
      <AudioLoader />
      <label>
        Midi Offset(ms):
        <NumberInput
          min={-60000}
          max={60000}
          defaultValue={midiOffsetInSec * 1000}
          onChange={handleMidiOffsetChange}
        />
      </label>
      <label>
        Volume:
        <NumberInput
          min={0}
          max={1}
          step={0.1}
          defaultValue={volume}
          onChange={handleVolumeChange}
        />
      </label>
      <Tracks />
    </div>
  );
};
