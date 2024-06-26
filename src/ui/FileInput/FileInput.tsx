import type { ChangeEvent } from "react";
import styles from "./FileInput.module.css";
import { cx } from "@/util";

type Props = {
  disabled?: boolean;
  onLoad: (file: File) => void;
  extensions: string[];
  children?: React.ReactNode;
};
export const FileInput = ({
  disabled,
  onLoad,
  extensions,
  children,
}: Props) => {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      onLoad(file);
    }
  };
  return (
    <span className={cx("button", styles.fileInput)}>
      <input
        disabled={disabled}
        type="file"
        onChange={handleFileChange}
        accept={extensions.join(",")}
      />
      {children || "Select"}
    </span>
  );
};
