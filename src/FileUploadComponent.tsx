import { ChangeEvent } from "react";

const FileUploadComponent = (props: { onLoad: (file: File) => void }) => {
  const { onLoad } = props;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    onLoad(file!);
  };
  return <input type="file" onChange={handleFileChange} />;
};

export default FileUploadComponent;
