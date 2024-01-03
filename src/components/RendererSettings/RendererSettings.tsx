import { useCounter } from "@/counter";
import { Select } from "@/ui/Select";
import styles from "./RendererSettings.module.css";
import { ControlLabel } from "@/ui/ControlLabel";
import { InputSlider } from "@/ui/InputSlider";
import {
  useRendererLoader,
  useRendererNames,
  useRendererUpdater,
} from "@/usecase/renderer";

export const RendererSettings = () => {
  useCounter("RendererSettings");
  const rendererNames = useRendererNames();
  const { selectedRenderer, selectRenderer } = useRendererLoader();

  return (
    <div className={styles.settings}>
      <ControlLabel text="Renderer" className={styles.settingsParam}>
        <div>
          <Select
            onChange={selectRenderer}
            value={selectedRenderer}
            options={rendererNames}
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
                defaultValue={props[p.id] ?? p.defaultValue}
                onChange={(value) => setProp(p.id, value)}
              />
            ) : p.type === "boolean" ? (
              <input
                type="checkbox"
                checked={!!(props[p.id] ?? p.defaultValue)}
                onChange={(e) => setProp(p.id, e.target.checked ? 1 : 0)}
              />
            ) : null}
          </ControlLabel>
        );
      })}
    </>
  );
};
