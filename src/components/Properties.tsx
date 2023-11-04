import { NumberInput } from "@/ui/NumberInput";
import { useCounter } from "@/counter";
import { useAtom, useAtomValue } from "jotai";
import {
  audioOffsetAtom,
  gainNodeAtom,
  midiOffsetAtom,
  opacityAtom,
  rendererAtom,
  volumeAtom,
} from "@/atoms";
import { useEffect } from "react";
import { RendererState, importRendererModule, renderers } from "@/model/render";
import { Select } from "@/ui/Select";

export const Properties = () => {
  useCounter("Properties");
  const [midiOffsetInSec, setMidiOffsetInSec] = useAtom(midiOffsetAtom);
  const [audioOffsetInSec, setAudioOffsetInSec] = useAtom(audioOffsetAtom);
  const [volume, setVolume] = useAtom(volumeAtom);
  const [opacity, setOpacity] = useAtom(opacityAtom);
  const gainNode = useAtomValue(gainNodeAtom);
  const [renderer, setRenderer] = useAtom(rendererAtom);
  useEffect(() => {
    if (renderer.type !== "Loading") {
      return;
    }
    const info = renderer.info;
    void (async () => {
      try {
        const module = await importRendererModule(info.url);
        const props = {} as Record<string, number>;
        for (const prop of module.config.props) {
          props[prop.id] = prop.defaultValue;
        }
        setRenderer({ type: "Ready", module, info, props });
      } catch (e) {
        console.error(e);
        setRenderer({ type: "Error", info });
      }
    })();
  }, [renderer, setRenderer]);
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
  const handleSelectRenderer = (name: string) => {
    const renderer = renderers.find((r) => r.name === name)!;
    setRenderer({ type: "Loading", info: renderer });
  };
  const handleCustomPropChange = (key: string, value: number) => {
    if (renderer.type !== "Ready") {
      return;
    }
    setRenderer({ ...renderer, props: { ...renderer.props, [key]: value } });
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
      <label>
        Renderer:
        <Select
          onChange={handleSelectRenderer}
          value={renderer.info.name}
          options={renderers.map((r) => r.name)}
        ></Select>
      </label>
      <RendererConfig
        renderer={renderer}
        onCustomPropChange={handleCustomPropChange}
      ></RendererConfig>
    </>
  );
};
const RendererConfig = ({
  renderer,
  onCustomPropChange,
}: {
  renderer: RendererState;
  onCustomPropChange: (key: string, value: number) => void;
}) => {
  if (renderer.type !== "Ready") {
    return null;
  }
  return (
    <>
      {renderer.module.config.props.map((p) => {
        return (
          <label key={p.id}>
            {p.name}:
            <NumberInput
              min={p.min}
              max={p.max}
              step={p.step}
              defaultValue={p.defaultValue}
              onChange={(value) => onCustomPropChange(p.id, value)}
            />
          </label>
        );
      })}
    </>
  );
};
