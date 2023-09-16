import { FileInput } from "@/ui/FileInput";
import { Image, Size } from "@/model/types";
import { useState } from "react";
import { useCounter } from "@/counter";

type Props = {
  onLoad: (image: Image) => void;
};
export const ImageLoader = ({ onLoad }: Props) => {
  useCounter("ImageLoader");
  const [size, setSize] = useState<Size | null>(null);
  const handleLoadImage = (file: File) => {
    void (async () => {
      const image = await getImageInfo(file);
      setSize(image.size);
      onLoad(image);
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
async function getImageInfo(file: File): Promise<Image> {
  const buffer = await file.arrayBuffer();
  const blob = new Blob([buffer], { type: file.type });
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const size = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };
      URL.revokeObjectURL(img.src);
      resolve({ size, url: URL.createObjectURL(blob) });
    };
    img.onerror = (error) => {
      reject(error);
    };
    img.src = URL.createObjectURL(file);
  });
}
