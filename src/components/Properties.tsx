import { NumberInput } from "@/ui/NumberInput";
import { useCounter } from "@/counter";
import { useAtom } from "jotai";
import {
  audioOffsetAtom,
  maxNoteAtom,
  midiOffsetAtom,
  minNoteAtom,
} from "@/atoms";

export const Properties = () => {
  useCounter("Properties");
  const [midiOffsetInSec, setMidiOffsetInSec] = useAtom(midiOffsetAtom);
  const [audioOffsetInSec, setAudioOffsetInSec] = useAtom(audioOffsetAtom);
  const [minNote, setMinNote] = useAtom(minNoteAtom);
  const [maxNote, setMaxNote] = useAtom(maxNoteAtom);
  const handleMinNoteChange = (minNote: number) => {
    setMinNote(minNote);
  };
  const handleMaxNoteChange = (maxNote: number) => {
    setMaxNote(maxNote);
  };
  const handleMidiOffsetChange = (midiOffsetInMilliSec: number) => {
    setMidiOffsetInSec(midiOffsetInMilliSec / 1000);
  };
  const handleAudioOffsetChange = (audioOffsetInMilliSec: number) => {
    setAudioOffsetInSec(audioOffsetInMilliSec / 1000);
  };
  return (
    <>
      <label>
        Min Note:
        <NumberInput
          min={0}
          max={127}
          defaultValue={minNote}
          onChange={handleMinNoteChange}
        />
      </label>
      <label>
        Max Note:
        <NumberInput
          min={0}
          max={127}
          defaultValue={maxNote}
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
    </>
  );
};
