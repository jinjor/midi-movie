export const NumberInput = ({
  defaultValue,
  onChange,
}: {
  defaultValue: number;
  onChange: (value: number) => void;
}) => {
  return (
    <input
      type="number"
      defaultValue={defaultValue}
      onChange={(e) => {
        onChange(Number(e.target.value));
      }}
    />
  );
};
