import { useCounter } from "@/counter";
import { RendererState, renderers } from "@/domain/render";
import { Select } from "@/ui/Select";
import styles from "./RendererSettings.module.css";
import { ControlLabel } from "@/ui/ControlLabel";
import { InputSlider } from "@/ui/InputSlider";
import { useRenderer } from "@/usecase/renderer";

export const RendererSettings = () => {
  useCounter("RendererSettings");

  const { renderer, selectedRenderer, props, selectRenderer, setProp } =
    useRenderer(true);

  return (
    <div className={styles.settings}>
      <ControlLabel text="Renderer" className={styles.settingsParam}>
        <div>
          <Select
            onChange={selectRenderer}
            value={selectedRenderer}
            options={renderers.map((r) => r.name)}
          />
        </div>
      </ControlLabel>
      <RendererConfig
        renderer={renderer}
        onCustomPropChange={setProp}
        props={props}
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