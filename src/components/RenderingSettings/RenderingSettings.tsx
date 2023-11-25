import { NumberInput } from "@/ui/NumberInput";
import { useCounter } from "@/counter";
import { useAtom } from "jotai";
import {
  allRendererPropsAtom,
  opacityAtom,
  rendererAtom,
  selectedRendererAtom,
} from "@/atoms";
import { useEffect } from "react";
import { RendererState, importRendererModule, renderers } from "@/model/render";
import { Select } from "@/ui/Select";
import styles from "./RenderingSettings.module.css";

export const RenderingSettings = () => {
  useCounter("RenderingSettings");

  const [opacity, setOpacity] = useAtom(opacityAtom);
  const [renderer, setRenderer] = useAtom(rendererAtom);
  const [selectedRenderer, setSelectedRenderer] = useAtom(selectedRendererAtom);
  const [allRendererProps, setAllRendererProps] = useAtom(allRendererPropsAtom);
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
        Renderer:
        <Select
          onChange={handleSelectRenderer}
          value={selectedRenderer}
          options={renderers.map((r) => r.name)}
        ></Select>
      </label>
      <RendererConfig
        renderer={renderer}
        onCustomPropChange={handleCustomPropChange}
        props={allRendererProps[selectedRenderer]}
      ></RendererConfig>
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
          <label key={p.id}>
            {p.name}:
            <NumberInput
              min={p.min}
              max={p.max}
              step={p.step}
              defaultValue={props[p.id] ?? p.defaultValue}
              onChange={(value) => onCustomPropChange(p.id, value)}
            />
          </label>
        );
      })}
    </>
  );
};
