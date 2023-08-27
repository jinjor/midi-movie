import { FileInput } from "./FileInput";
import { Size } from "./model";

export type Image = {
  imageUrl: string;
  size: Size;
};
type Props = {
  onLoad: (audioBuffer: AudioBuffer) => void;
};
export const AudioLoader = ({ onLoad }: Props) => {
  const handleLoadAudio = (file: File) => {
    void (async () => {
      const arrayBuffer = await file.arrayBuffer();
      const ctx = new AudioContext();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      onLoad(audioBuffer);
    })();
  };
  return (
    <label>
      <span>Audio:</span>
      <FileInput
        onLoad={handleLoadAudio}
        extensions={[".wav"]} // ["audio/*"] でもいける？
      />
    </label>
  );
};
