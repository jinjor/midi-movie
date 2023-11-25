import { FileInput } from "@/ui/FileInput";
import { Size } from "@/model/types";
import { formatTime } from "../util";
import { useCounter } from "@/counter";
import { audioBufferAtom } from "@/atoms";
import { useAtom } from "jotai";
import { useState } from "react";

export type Image = {
  imageUrl: string;
  size: Size;
};
export const AudioLoader = () => {
  useCounter("AudioLoader");
  const [audioBuffer, setAudioBuffer] = useAtom(audioBufferAtom);
  const [name, setName] = useState("");
  const handleLoadAudio = (file: File) => {
    void (async () => {
      const arrayBuffer = await file.arrayBuffer();
      const ctx = new AudioContext();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      setName(file.name);
      setAudioBuffer(audioBuffer);
    })();
  };
  return (
    <label>
      Audio:
      <FileInput onLoad={handleLoadAudio} extensions={[".wav"]}>
        {name && audioBuffer && (
          <>
            <span>{name}</span>
            <br />
            <span>{formatTime(audioBuffer.duration)}</span>
          </>
        )}
      </FileInput>
    </label>
  );
};
