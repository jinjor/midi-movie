import { NumberInput } from "./ui/NumberInput";
import { Mutables } from "./model";

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
  const handleMinNoteChange = (minNote: number) => {
    mutablesRef.current.minNote = minNote;
  };
  const handleMaxNoteChange = (maxNote: number) => {
    mutablesRef.current.maxNote = maxNote;
  };
  const handleMidiOffsetChange = (midiOffsetInMilliSec: number) => {
    onMidiOffsetChange(midiOffsetInMilliSec / 1000);
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
          defaultValue={midiOffsetInSec * 1000}
          onChange={handleMidiOffsetChange}
        />
      </label>
    </>
  );
};
