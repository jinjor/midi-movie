import { useCounter } from "@/counter";
import { NumberInput } from "../NumberInput";
import { useCallback } from "react";
import { NumberSlider } from "../NumberSlider";
import styles from "./InputSlider.module.css";
import { cx } from "@/util";

type Props = {
  className?: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
  step?: number;
};

export const InputSlider = ({
  className,
  value,
  onChange,
  max,
  min,
  step,
}: Props) => {
  useCounter("InputSlider");
  const sharedValue = value ?? min ?? max ?? 0;
  const handleChange = useCallback(
    (value: number) => {
      onChange(value);
    },
    [onChange],
  );
  return (
    <div className={cx(styles.InputSlider, className)}>
      <NumberInput
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
