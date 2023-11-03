import { NumberInput } from "@/ui/NumberInput";
import { useCounter } from "@/counter";
import { useAtom, useAtomValue } from "jotai";
import {
  audioOffsetAtom,
  gainNodeAtom,
  maxNoteAtom,
  midiOffsetAtom,
  minNoteAtom,
  opacityAtom,
  volumeAtom,
} from "@/atoms";

export const Properties = () => {
  useCounter("Properties");
  const [midiOffsetInSec, setMidiOffsetInSec] = useAtom(midiOffsetAtom);
  const [audioOffsetInSec, setAudioOffsetInSec] = useAtom(audioOffsetAtom);
  const [minNote, setMinNote] = useAtom(minNoteAtom);
  const [maxNote, setMaxNote] = useAtom(maxNoteAtom);
  const [volume, setVolume] = useAtom(volumeAtom);
  const [opacity, setOpacity] = useAtom(opacityAtom);
  const gainNode = useAtomValue(gainNodeAtom);
  const handleMinNoteChange = (minNote: number) => {
    setMinNote(minNote);
  };
  const handleMaxNoteChange = (maxNote: number) => {
    setMaxNote(maxNote);
  };
  const handleMidiOffsetChange = (midiOffsetInMilliSec: number) => {
    setMidiOffsetInSec(midiOffsetInMilliSec / 1000);
  };
  const handleAudioOffsetChange = (audioOffsetInMilliSec: number) => {
    setAudioOffsetInSec(audioOffsetInMilliSec / 1000);
  };
  const handleOpacityChange = (opacity: number) => {
    setOpacity(opacity);
  };
  const handleVolumeChange = (volume: number) => {
    setVolume(volume);
    if (gainNode) {
      gainNode.gain.value = volume;
    }
  };
  return (
    <>
      <label>
        Min Note:
        <NumberInput
          min={0}
          max={127}
          defaultValue={minNote}
          onChange={handleMinNoteChange}
        />
      </label>
      <label>
        Max Note:
        <NumberInput
          min={0}
          max={127}
          defaultValue={maxNote}
          onChange={handleMaxNoteChange}
        />
      </label>
      <label>
        Midi Offset(ms):
        <NumberInput
          min={-60000}
          max={60000}
          defaultValue={midiOffsetInSec * 1000}
          onChange={handleMidiOffsetChange}
        />
      </label>
      <label>
        Audio Offset(ms):
        <NumberInput
          min={-60000}
          max={60000}
          defaultValue={audioOffsetInSec * 1000}
          onChange={handleAudioOffsetChange}
        />
      </label>
      <label>
        Overlay Opacity:
        <NumberInput
          min={0}
          max={1}
          step={0.1}
          defaultValue={opacity}
          onChange={handleOpacityChange}
        />
      </label>
      <label>
        Volume:
        <NumberInput
          min={0}
          max={1}
          step={0.1}
          defaultValue={volume}
          onChange={handleVolumeChange}
        />
      </label>
    </>
  );
};
