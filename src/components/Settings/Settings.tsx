import { useCounter } from "@/counter";
import { useAtom } from "jotai";
import {
  allRendererPropsAtom,
  midiOffsetAtom,
  opacityAtom,
  rendererAtom,
  selectedRendererAtom,
  volumeAtom,
} from "@/atoms";
import { useEffect } from "react";
import { RendererState, importRendererModule, renderers } from "@/model/render";
import { Select } from "@/ui/Select";
import styles from "./Settings.module.css";
import { ControlLabel } from "@/ui/ControlLabel";
import { InputSlider } from "@/ui/InputSlider";

export const Settings = () => {
  useCounter("Settings");

  const [opacity, setOpacity] = useAtom(opacityAtom);
  const [renderer, setRenderer] = useAtom(rendererAtom);
  const [selectedRenderer, setSelectedRenderer] = useAtom(selectedRendererAtom);
  const [allRendererProps, setAllRendererProps] = useAtom(allRendererPropsAtom);
  const [midiOffsetInSec, setMidiOffsetInSec] = useAtom(midiOffsetAtom);
  const [volume, setVolume] = useAtom(volumeAtom);
  useEffect(() => {
    if (renderer.type !== "Loading") {
      return;
    }
    const info = renderers.find((r) => r.name === selectedRenderer);
    if (info == null) {
      console.error(`Renderer ${selectedRenderer} not found`);
      return;
    }
    void (async () => {
      try {
        const module = await importRendererModule(info.url);
        const props = { ...allRendererProps[selectedRenderer] };
        for (const prop of module.config.props) {
          props[prop.id] = props[prop.id] ?? prop.defaultValue;
        }
        setRenderer({ type: "Ready", module });
        setAllRendererProps({ ...allRendererProps, [selectedRenderer]: props });
      } catch (e) {
        console.error(e);
        setRenderer({ type: "Error" });
      }
    })();
  }, [
    allRendererProps,
    renderer,
    selectedRenderer,
    setAllRendererProps,
    setRenderer,
  ]);
  const handleMidiOffsetChange = (midiOffsetInMilliSec: number) => {
    setMidiOffsetInSec(midiOffsetInMilliSec / 1000);
  };
  const handleVolumeChange = (volume: number) => {
    setVolume(volume);
  };
  const handleOpacityChange = (opacity: number) => {
    setOpacity(opacity);
  };
  const handleSelectRenderer = (name: string) => {
    setSelectedRenderer(name);
    setRenderer({ type: "Loading" });
  };
  const handleCustomPropChange = (key: string, value: number) => {
    if (renderer.type !== "Ready") {
      return;
    }
    setAllRendererProps({
      ...allRendererProps,
      [selectedRenderer]: {
        ...allRendererProps[selectedRenderer],
        [key]: value,
      },
    });
  };
  return (
    <div className={styles.renderingSettings}>
      <ControlLabel text="Midi Offset(ms)">
        <InputSlider
          className={styles.inputSlider}
          min={-60000}
          max={60000}
          defaultValue={midiOffsetInSec * 1000}
          onChange={handleMidiOffsetChange}
        />
      </ControlLabel>
      <ControlLabel text="Volume">
        <InputSlider
          className={styles.inputSlider}
          min={0}
          max={1}
          step={0.1}
          defaultValue={volume}
          onChange={handleVolumeChange}
        />
      </ControlLabel>
      <ControlLabel text="Overlay Opacity">
        <InputSlider
          className={styles.inputSlider}
          min={0}
          max={1}
          step={0.1}
          defaultValue={opacity}
          onChange={handleOpacityChange}
        />
      </ControlLabel>
      <ControlLabel text="Renderer">
        <div>
          <Select
            onChange={handleSelectRenderer}
            value={selectedRenderer}
            options={renderers.map((r) => r.name)}
          />
        </div>
      </ControlLabel>
      <RendererConfig
        renderer={renderer}
        onCustomPropChange={handleCustomPropChange}
        props={allRendererProps[selectedRenderer]}
      />
    </div>
  );
};
const RendererConfig = ({
  renderer,
  onCustomPropChange,
  props,
}: {
  renderer: RendererState;
  onCustomPropChange: (key: string, value: number) => void;
  props: Record<string, number>;
}) => {
  if (renderer.type !== "Ready") {
    return null;
  }
  return (
    <>
      {renderer.module.config.props.map((p) => {
        return (
          <ControlLabel key={p.id} text={p.name}>
            {p.type === "number" ? (
              <InputSlider
                className={styles.inputSlider}
                min={p.min}
                max={p.max}
                step={p.step}
                defaultValue={props[p.id] ?? p.defaultValue}
                onChange={(value) => onCustomPropChange(p.id, value)}
              />
            ) : p.type === "boolean" ? (
              <input
                type="checkbox"
                checked={!!(props[p.id] ?? p.defaultValue)}
                onChange={(e) =>
                  onCustomPropChange(p.id, e.target.checked ? 1 : 0)
                }
              />
            ) : null}
          </ControlLabel>
        );
      })}
    </>
  );
};
