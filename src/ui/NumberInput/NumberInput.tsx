import { cx } from "@/util";
import { useCounter } from "../../counter";

type Props = {
  className?: string;
  value?: number;
  defaultValue?: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
  step?: number;
};

export const NumberInput = ({
  className,
  value,
  defaultValue,
  onChange,
  max,
  min,
  step,
}: Props) => {
  useCounter("NumberInput");
  return (
    <input
      className={cx(className)}
      type="number"
      max={max}
      min={min}
      step={step}
      value={value}
      defaultValue={defaultValue}
      onChange={(e) => {
        onChange(Number(e.target.value));
      }}
    />
  );
};
