import { FileInput } from "@/ui/FileInput";
import { useCounter } from "@/counter";
import { formatTime } from "@/util";
import { useMidiLoader } from "@/usecase/midi";

export const MidiLoader = () => {
  useCounter("MidiLoader");
  const { midiData, status, loadMidi } = useMidiLoader();
  return (
    <FileInput
      disabled={status === "loading"}
      onLoad={loadMidi}
      extensions={[".mid", "midi"]}
    >
      {midiData && (
        <>
          <span>{midiData.fileName}</span> |{" "}
          <span>{formatTime(midiData.endSec)}</span>
        </>
      )}
    </FileInput>
  );
};
