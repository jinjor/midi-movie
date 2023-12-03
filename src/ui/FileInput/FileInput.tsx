import { ChangeEvent } from "react";
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
    if (!file) return;
    onLoad(file);
  };
  return (
    <div className={cx("button", styles.fileInput)}>
      <input
        disabled={disabled}
        type="file"
        onChange={handleFileChange}
        accept={extensions.join(",")}
      />
      {children || "Select"}
    </div>
  );
};
