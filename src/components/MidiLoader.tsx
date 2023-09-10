import { FileInput } from "@/ui/FileInput";
import { parseMidiData } from "@/model/midi";
import { MidiData } from "@/model/types";

type Props = {
  onLoad: (midiData: MidiData) => void;
};
export const MidiLoader = ({ onLoad }: Props) => {
  const handleLoadMidi = (file: File) => {
    void (async () => {
      const buffer = await file.arrayBuffer();
      const midiData = parseMidiData(buffer);
      onLoad(midiData);
    })();
  };
  return (
    <label>
      <span>MIDI:</span>
      <FileInput onLoad={handleLoadMidi} extensions={[".mid", "midi"]} />
    </label>
  );
};
