import { useCounter } from "@/counter";
import { useCallback } from "react";
import { SeekBar } from "../SeekBar";

type Props = {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
  step?: number;
};

export const NumberSlider = ({
  value,
  onChange,
  max = 0,
  min = 0,
  step = 1,
}: Props) => {
  useCounter("InputSlider");
  const handleChange = useCallback(
    (ratio: number) => {
      const value = min + Math.floor(((max - min) * ratio) / step) * step;
      onChange(value);
    },
    [onChange, min, max, step],
  );
  const disabled = max <= min;
  const truncatedValue = Math.max(min, Math.min(max, value));
  return (
    <SeekBar
      disabled={disabled}
      value={(truncatedValue - min) / (max - min)}
      onStartDragging={handleChange}
      onDrag={handleChange}
    />
  );
};
