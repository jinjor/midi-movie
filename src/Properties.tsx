import { NumberInput } from "./ui/NumberInput";
import { Mutables } from "./model";

type Props = {
  mutablesRef: React.MutableRefObject<Mutables>;
};

export const Properties = ({ mutablesRef }: Props) => {
  const onMinNoteChange = (minNote: number) => {
    mutablesRef.current.minNote = minNote;
  };
  const onMaxNoteChange = (maxNote: number) => {
    mutablesRef.current.maxNote = maxNote;
  };
  return (
    <>
      <label>
        Min note:
        <NumberInput
          defaultValue={mutablesRef.current.minNote}
          onChange={onMinNoteChange}
        />
      </label>
      <label>
        Max note:
        <NumberInput
          defaultValue={mutablesRef.current.maxNote}
          onChange={onMaxNoteChange}
        />
      </label>
    </>
  );
};
