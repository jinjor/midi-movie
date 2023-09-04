import { NumberInput } from "./ui/NumberInput";
import { Mutables } from "./model";
import {
  getMountCount,
  getTotalCallbackCount,
  getTotalRenderCount,
  resetCount,
} from "./counter";

type Props = {
  mutablesRef: React.MutableRefObject<Mutables>;
  midiOffsetInSec: number;
  onMidiOffsetChange: (midiOffsetInSec: number) => void;
  audioOffsetInSec: number;
  onAudioOffsetChange: (audioOffsetInSec: number) => void;
};

export const Properties = ({
  mutablesRef,
  midiOffsetInSec,
  onMidiOffsetChange,
  audioOffsetInSec,
  onAudioOffsetChange,
}: Props) => {
  const handleMinNoteChange = (minNote: number) => {
    mutablesRef.current.minNote = minNote;
  };
  const handleMaxNoteChange = (maxNote: number) => {
    mutablesRef.current.maxNote = maxNote;
  };
  const handleMidiOffsetChange = (midiOffsetInMilliSec: number) => {
    onMidiOffsetChange(midiOffsetInMilliSec / 1000);
  };
  const handleAudioOffsetChange = (audioOffsetInMilliSec: number) => {
    onAudioOffsetChange(audioOffsetInMilliSec / 1000);
  };
  const handleDebug = () => {
    console.log(
      "FileInput:getTotalRenderCount",
      getTotalRenderCount("FileInput")
    );
    console.log(
      "FileInput:getTotalCallbackCount",
      getTotalCallbackCount("FileInput", "handleFileChange")
    );
    console.log("FileInput:getMountCount", getMountCount("FileInput"));
    console.log("Player:getTotalRenderCount", getTotalRenderCount("Player"));
    console.log(
      "Player:getTotalCallbackCount",
      getTotalCallbackCount("Player", "handlePlay")
    );
    console.log("Player:effect", getTotalCallbackCount("Player", "effect"));
    console.log("Player:getMountCount", getMountCount("Player"));
  };
  const handleReset = () => {
    resetCount();
  };
  return (
    <>
      <label>
        Min Note:
        <NumberInput
          min={0}
          max={127}
          defaultValue={mutablesRef.current.minNote}
          onChange={handleMinNoteChange}
        />
      </label>
      <label>
        Max Note:
        <NumberInput
          min={0}
          max={127}
          defaultValue={mutablesRef.current.maxNote}
          onChange={handleMaxNoteChange}
        />
      </label>
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
        Audio Offset(ms):
        <NumberInput
          min={-60000}
          max={60000}
          defaultValue={audioOffsetInSec * 1000}
          onChange={handleAudioOffsetChange}
        />
      </label>
      <button onClick={handleDebug}>Debug</button>
      <button onClick={handleReset}>Reset</button>
    </>
  );
};
