export const NumberInput = ({
  defaultValue,
  onChange,
  max,
  min,
}: {
  defaultValue: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
}) => {
  return (
    <input
      type="number"
      max={max}
      min={min}
      defaultValue={defaultValue}
      onChange={(e) => {
        onChange(Number(e.target.value));
      }}
    />
  );
};
