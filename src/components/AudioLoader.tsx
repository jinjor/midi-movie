import { FileInput } from "@/ui/FileInput";
import { Size } from "@/model/types";
import { formatTime } from "../util";
import { useCounter } from "@/counter";
import { audioBufferAtom } from "@/atoms";
import { useAtom } from "jotai";

export type Image = {
  imageUrl: string;
  size: Size;
};
export const AudioLoader = () => {
  useCounter("AudioLoader");
  const [audioBuffer, setAudioBuffer] = useAtom(audioBufferAtom);
  const handleLoadAudio = (file: File) => {
    void (async () => {
      const arrayBuffer = await file.arrayBuffer();
      const ctx = new AudioContext();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      setAudioBuffer(audioBuffer);
    })();
  };
  return (
    <label>
      <span>Audio:</span>
      <FileInput onLoad={handleLoadAudio} extensions={[".wav"]} />
      {audioBuffer && <span>{formatTime(audioBuffer.duration)}</span>}
    </label>
  );
};
