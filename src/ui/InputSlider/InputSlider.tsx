import { useCounter } from "@/counter";
import { NumberInput } from "../NumberInput";
import { useCallback, useState } from "react";
import { NumberSlider } from "../NumberSlider";
import styles from "./InputSlider.module.css";

type Props = {
  value?: number;
  defaultValue?: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
  step?: number;
};

export const InputSlider = ({
  value,
  defaultValue,
  onChange,
  max,
  min,
  step,
}: Props) => {
  useCounter("InputSlider");
  const [sharedValue, setSharedValue] = useState(
    value ?? defaultValue ?? min ?? max ?? 0,
  );
  const handleChange = useCallback(
    (value: number) => {
      setSharedValue(value);
      onChange(value);
    },
    [onChange],
  );
  return (
    <div className={styles.InputSlider}>
      <NumberInput
        className={styles.InputSliderInput}
        min={min}
        max={max}
        step={step}
        value={sharedValue}
        onChange={handleChange}
      />
      <NumberSlider
        min={min}
        max={max}
        step={step}
        value={sharedValue}
        onChange={handleChange}
      />
    </div>
  );
};
