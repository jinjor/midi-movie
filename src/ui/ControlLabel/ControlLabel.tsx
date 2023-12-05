import { ReactNode } from "react";
import styles from "./ControlLabel.module.css";

type Props = {
  text: string;
  className?: string;
  children: ReactNode;
};

export const ControlLabel = ({ text, className, children }: Props) => {
  return (
    <label className={className}>
      <span className={styles.ContollLabelText}>{text}</span>
      {children}
    </label>
  );
};
