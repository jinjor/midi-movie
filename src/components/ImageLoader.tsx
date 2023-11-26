import { FileInput } from "@/ui/FileInput";
import { Image } from "@/model/types";
import { useCounter } from "@/counter";
import { useAtom } from "jotai";
import { imageUrlAtom, imageSizeAtom } from "@/atoms";
import { useState } from "react";

export const ImageLoader = () => {
  useCounter("ImageLoader");
  const [size, setSize] = useAtom(imageSizeAtom);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useAtom(imageUrlAtom);
  const handleLoadImage = (file: File) => {
    void (async () => {
      const image = await getImageInfo(file);
      setName(file.name);
      setImageUrl(image.url);
      setSize(image.size);
    })();
  };
  return (
    <label>
      Image:
      <FileInput onLoad={handleLoadImage} extensions={[".png", "jpg", "jpeg"]}>
        {name && imageUrl && (
          <>
            <span>{name}</span> |{" "}
            <span>
              {" "}
              {size.width} x {size.height}
            </span>
          </>
        )}
      </FileInput>
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
