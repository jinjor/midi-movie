import { NumberInput } from "@/ui/NumberInput";
import { useCounter } from "@/counter";
import { useAtom, useAtomValue } from "jotai";
import {
  audioOffsetAtom,
  customPropsAtom,
  gainNodeAtom,
  midiOffsetAtom,
  opacityAtom,
  rendererAtom,
  volumeAtom,
} from "@/atoms";
import { useEffect, useState } from "react";
import { RendererModule, importRendererModule } from "@/model/render";

export const Properties = () => {
  useCounter("Properties");
  const [midiOffsetInSec, setMidiOffsetInSec] = useAtom(midiOffsetAtom);
  const [audioOffsetInSec, setAudioOffsetInSec] = useAtom(audioOffsetAtom);
  const [volume, setVolume] = useAtom(volumeAtom);
  const [opacity, setOpacity] = useAtom(opacityAtom);
  const gainNode = useAtomValue(gainNodeAtom);
  const renderer = useAtomValue(rendererAtom);
  const [customProps, setCustomProps] = useAtom(customPropsAtom);
  const [rendererConfig, setRendererConfig] = useState<
    RendererModule["config"] | null
  >(null);
  useEffect(() => {
    void (async () => {
      const module = await importRendererModule(renderer);
      setRendererConfig(module.config);
      const props = {} as Record<string, number>;
      for (const prop of module.config.props) {
        props[prop.id] = prop.defaultValue;
      }
      setCustomProps(props);
    })();
  }, [renderer, setCustomProps]);
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
  const handleCustomPropChange = (key: string, value: number) => {
    setCustomProps((prev) => ({ ...prev, [key]: value }));
  };
  return (
    <>
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
      {(rendererConfig?.props ?? []).map((p) => {
        return (
          <label key={p.id}>
            {p.name}:
            <NumberInput
              min={p.min}
              max={p.max}
              step={p.step}
              defaultValue={customProps[p.id]}
              onChange={(value) => handleCustomPropChange(p.id, value)}
            />
          </label>
        );
      })}
    </>
  );
};
