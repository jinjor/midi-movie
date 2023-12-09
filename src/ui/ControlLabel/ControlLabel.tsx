import { ReactNode } from "react";
import styles from "./ControlLabel.module.css";
import { cx } from "@/util";

type Props = {
  text: string;
  className?: string;
  children: ReactNode;
};

export const ControlLabel = ({ text, className, children }: Props) => {
  return (
    <label className={cx(styles.ControlLabel, className)}>
      <span className={styles.ControlLabelText}>{text}</span>
      {children}
    </label>
  );
};
