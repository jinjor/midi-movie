import { ChangeEvent } from "react";
import styles from "./FIleUpload.module.css";
import { cx } from "./util";

type Props = {
  onLoad: (file: File) => void;
  extensions: string[];
};
export const FileInput = ({ onLoad, extensions }: Props) => {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    onLoad(file!);
  };
  return (
    <input
      className={cx(styles.input)}
      type="file"
      onChange={handleFileChange}
      accept={extensions.join(",")}
    />
  );
};
