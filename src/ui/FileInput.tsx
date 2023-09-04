import { ChangeEvent } from "react";
import { useCounter } from "../counter";

type Props = {
  onLoad: (file: File) => void;
  extensions: string[];
};
export const FileInput = ({ onLoad, extensions }: Props) => {
  const { countCallback } = useCounter("FileInput");
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    countCallback("handleFileChange");
    const file = event.target.files?.[0];
    onLoad(file!);
  };
  return (
    <input
      type="file"
      onChange={handleFileChange}
      accept={extensions.join(",")}
    />
  );
};
