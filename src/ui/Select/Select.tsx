import { useCounter } from "../../counter";

export const Select = ({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) => {
  useCounter("Select");
  return (
    <div className="select">
      <select
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <svg viewBox="-6 -9 24 24">
        <path d="M 0 0 L 6 6 L 12 0" fill="currentColor" />
      </svg>
    </div>
  );
};
