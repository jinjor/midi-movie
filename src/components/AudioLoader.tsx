import { FileInput } from "@/ui/FileInput";
import { Size } from "@/model/types";
import { formatTime } from "../util";
import { useCounter } from "@/counter";
import { audioBufferAtom } from "@/atoms";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { arrayBufferToBase64, base64ToArrayBuffer } from "@/model/base64";
import { useFileStorage } from "@/fileStorage";

export type Image = {
  imageUrl: string;
  size: Size;
};
export const AudioLoader = () => {
  useCounter("AudioLoader");
  const [audioBuffer, setAudioBuffer] = useAtom(audioBufferAtom);
  const [name, setName] = useState("");
  const { save, data: audioFile } = useFileStorage("audio");
  useEffect(() => {
    if (audioFile) {
      void (async () => {
        const arrayBuffer = base64ToArrayBuffer(audioFile.data);
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
      save({
        name: file.name,
        type: file.type,
        loadedAt: Date.now(),
        data: arrayBufferToBase64(arrayBuffer),
      });
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
            <span>{name}</span> |{" "}
            <span>{formatTime(audioBuffer.duration)}</span>
          </>
        )}
      </FileInput>
    </label>
  );
};
