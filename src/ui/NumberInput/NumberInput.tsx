import { useCounter } from "../../counter";

export const NumberInput = ({
  defaultValue,
  onChange,
  max,
  min,
  step,
}: {
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
      defaultValue={defaultValue}
      onChange={(e) => {
        onChange(Number(e.target.value));
      }}
    />
  );
};
