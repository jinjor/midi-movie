import { useCounter } from "../../counter";

export const NumberInput = ({
  value,
  defaultValue,
  onChange,
  max,
  min,
  step,
}: {
  value?: number;
  defaultValue?: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
  step?: number;
}) => {
  useCounter("NumberInput");
  return (
    <input
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
