import { FileInput } from "@/ui/FileInput";
import { Size } from "@/model/types";
import { useState } from "react";
import { formatTime } from "../util";

export type Image = {
  imageUrl: string;
  size: Size;
};
type Props = {
  onLoad: (audioBuffer: AudioBuffer) => void;
};
export const AudioLoader = ({ onLoad }: Props) => {
  const [duration, setDuration] = useState<number | null>(null);
  const handleLoadAudio = (file: File) => {
    void (async () => {
      const arrayBuffer = await file.arrayBuffer();
      const ctx = new AudioContext();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      setDuration(audioBuffer.duration);
      onLoad(audioBuffer);
    })();
  };
  return (
    <label>
      <span>Audio:</span>
      <FileInput onLoad={handleLoadAudio} extensions={[".wav"]} />
      {duration && <span>{formatTime(duration)}</span>}
    </label>
  );
};
