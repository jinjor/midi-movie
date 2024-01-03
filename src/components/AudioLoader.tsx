import { FileInput } from "@/ui/FileInput";
import { Size } from "@/domain/types";
import { formatTime } from "../util";
import { useCounter } from "@/counter";
import { useAudioLoader } from "@/usecase/audio";

export type Image = {
  imageUrl: string;
  size: Size;
};
export const AudioLoader = () => {
  useCounter("AudioLoader");
  const { audioBuffer, name, status, loadAudio } = useAudioLoader();
  return (
    <FileInput
      disabled={status === "loading"}
      onLoad={loadAudio}
      extensions={[".wav"]}
    >
      {name && audioBuffer && (
        <>
          <span>{name}</span> | <span>{formatTime(audioBuffer.duration)}</span>
        </>
      )}
    </FileInput>
  );
};
