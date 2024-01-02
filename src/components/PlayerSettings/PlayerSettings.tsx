import { useCounter } from "@/counter";
import styles from "./PlayerSettings.module.css";
import { ControlLabel } from "@/ui/ControlLabel";
import { InputSlider } from "@/ui/InputSlider";
import { useAudioSettings } from "@/usecase/audio";
import { useImageSettings } from "@/usecase/image";
import { cx } from "@/util";

export const PlayerSettings = (props: {
  className?: string;
}) => {
  const { className } = props;
  useCounter("PlayerSettings");

  const { volume, setVolume } = useAudioSettings();
  const { opacity, setOpacity } = useImageSettings();

  return (
    <div className={cx(styles.settings, className)}>
      <ControlLabel text="Volume" className={styles.settingsParam}>
        <InputSlider
          className={styles.inputSlider}
          min={0}
          max={1}
          step={0.1}
          defaultValue={volume}
          onChange={setVolume}
        />
      </ControlLabel>
      <ControlLabel text="Overlay Opacity" className={styles.settingsParam}>
        <InputSlider
          className={styles.inputSlider}
          min={0}
          max={1}
          step={0.1}
          defaultValue={opacity}
          onChange={setOpacity}
        />
      </ControlLabel>
    </div>
  );
};
