import { ChangeEvent } from "react";

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
      type="file"
      onChange={handleFileChange}
      accept={extensions.join(",")}
    />
  );
};
