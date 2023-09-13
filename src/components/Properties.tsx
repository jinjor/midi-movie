import { NumberInput } from "@/ui/NumberInput";
import { Mutables } from "@/model/types";
import { useCounter } from "@/counter";
import { useAtom } from "jotai";
import { audioOffsetAtom } from "@/atoms";

type Props = {
  mutablesRef: React.MutableRefObject<Mutables>;
  midiOffsetInSec: number;
  onMidiOffsetChange: (midiOffsetInSec: number) => void;
};

export const Properties = ({
  mutablesRef,
  midiOffsetInSec,
  onMidiOffsetChange,
}: Props) => {
  useCounter("Properties");
  const [audioOffsetInSec, setAudioOffsetInSec] = useAtom(audioOffsetAtom);
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
    setAudioOffsetInSec(audioOffsetInMilliSec / 1000);
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
    </>
  );
};
