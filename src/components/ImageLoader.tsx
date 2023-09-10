import { FileInput } from "../ui/FileInput";
import { Image, Size } from "../model/types";
import { useState } from "react";

type Props = {
  onLoad: (image: Image) => void;
};
export const ImageLoader = ({ onLoad }: Props) => {
  const [size, setSize] = useState<Size | null>(null);
  const handleLoadImage = (file: File) => {
    void (async () => {
      const buffer = await file.arrayBuffer();
      const size = await getImageSize(file);
      const blob = new Blob([buffer], { type: file.type });
      const url = URL.createObjectURL(blob);
      setSize(size);
      onLoad({ url, size });
    })();
  };
  return (
    <label>
      <span>Image:</span>
      <FileInput
        onLoad={handleLoadImage}
        extensions={[".png", "jpg", "jpeg"]}
      />
      {size && (
        <span>
          {size.width} x {size.height}
        </span>
      )}
    </label>
  );
};
async function getImageSize(file: File): Promise<Size> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();

    img.onload = () => {
      const size = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };

      URL.revokeObjectURL(img.src);
      resolve(size);
    };

    img.onerror = (error) => {
      reject(error);
    };

    img.src = URL.createObjectURL(file);
  });
}
