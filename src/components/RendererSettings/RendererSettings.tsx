import { useCounter } from "@/counter";
import { Select } from "@/ui/Select";
import styles from "./RendererSettings.module.css";
import { ControlLabel } from "@/ui/ControlLabel";
import { InputSlider } from "@/ui/InputSlider";
import {
  useRendererLoader as useRendererSelector,
  useRendererModules,
  useRendererUpdater,
} from "@/usecase/renderer";

export const RendererSettings = () => {
  useCounter("RendererSettings");
  const rendererModules = useRendererModules() ?? [];
  const { selectedRenderer, selectRenderer } = useRendererSelector();

  return (
    <div className={styles.settings}>
      <ControlLabel text="Renderer" className={styles.settingsParam}>
        <div>
          <Select
            onChange={selectRenderer}
            value={selectedRenderer}
            options={rendererModules.map((m) => m.meta.name)}
          />
        </div>
      </ControlLabel>
      <RendererConfig />
    </div>
  );
};
const RendererConfig = () => {
  useCounter("RendererConfig");
  const { renderer, props, setProp } = useRendererUpdater();
  if (renderer.type !== "Ready") {
    return null;
  }
  return (
    <>
      {renderer.module.config.props.map((p) => {
        const value = props[p.id];
        return (
          <ControlLabel
            key={p.id}
            text={p.name}
            className={styles.settingsParam}
          >
            {p.type === "number" ? (
              <InputSlider
                className={styles.inputSlider}
                min={p.min}
                max={p.max}
                step={p.step}
                value={value}
                onChange={(value) => setProp(p.id, value)}
              />
            ) : p.type === "boolean" ? (
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => setProp(p.id, e.target.checked ? 1 : 0)}
              />
            ) : null}
          </ControlLabel>
        );
      })}
    </>
  );
};
