import { FileInput } from "@/ui/FileInput";
import { Size } from "@/model/types";
import { formatTime } from "../util";
import { useCounter } from "@/counter";
import { audioBufferAtom } from "@/atoms";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useFileStorage } from "@/fileStorage";
import { ControlLabel } from "@/ui/ControlLabel";

export type Image = {
  imageUrl: string;
  size: Size;
};
export const AudioLoader = () => {
  useCounter("AudioLoader");
  const [audioBuffer, setAudioBuffer] = useAtom(audioBufferAtom);
  const [name, setName] = useState("");
  const { status, save, data: audioFile } = useFileStorage("audio");
  useEffect(() => {
    if (audioFile) {
      void (async () => {
        const arrayBuffer = audioFile.data;
        const ctx = new AudioContext();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        setName(audioFile.name);
        setAudioBuffer(audioBuffer);
      })();
    }
  }, [audioFile, setAudioBuffer]);
  const handleLoadAudio = (file: File) => {
    void (async () => {
      const arrayBuffer = await file.arrayBuffer();
      await save({
        name: file.name,
        type: file.type,
        loadedAt: Date.now(),
        data: arrayBuffer,
      });
      const ctx = new AudioContext();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      setName(file.name);
      setAudioBuffer(audioBuffer);
    })();
  };
  return (
    <ControlLabel text="Audio">
      <FileInput
        disabled={status === "loading"}
        onLoad={handleLoadAudio}
        extensions={[".wav"]}
      >
        {name && audioBuffer && (
          <>
            <span>{name}</span> |{" "}
            <span>{formatTime(audioBuffer.duration)}</span>
          </>
        )}
      </FileInput>
    </ControlLabel>
  );
};
