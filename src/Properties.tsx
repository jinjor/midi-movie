import { NumberInput } from "./NumberInput";

type Props = {
  minNote: number;
  maxNote: number;
  onMinNoteChange: (minNote: number) => void;
  onMaxNoteChange: (maxNote: number) => void;
};

export const Properties = ({
  minNote,
  maxNote,
  onMinNoteChange,
  onMaxNoteChange,
}: Props) => {
  return (
    <>
      <label>
        Min note:
        <NumberInput defaultValue={minNote} onChange={onMinNoteChange} />
      </label>
      <label>
        Max note:
        <NumberInput defaultValue={maxNote} onChange={onMaxNoteChange} />
      </label>
    </>
  );
};
