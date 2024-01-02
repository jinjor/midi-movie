import { FileInput } from "@/ui/FileInput";
import { Image } from "@/model/types";
import { useCounter } from "@/counter";
import { useAtom } from "jotai";
import { imageUrlAtom, imageSizeAtom } from "@/atoms";
import { useEffect, useState } from "react";
import { useFileStorage } from "@/storage/fileStorage";

export const ImageLoader = () => {
  useCounter("ImageLoader");
  const { status, save, data: imageFile } = useFileStorage("image");
  const [size, setSize] = useAtom(imageSizeAtom);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useAtom(imageUrlAtom);
  useEffect(() => {
    if (imageFile) {
      void (async () => {
        const image = await getImageInfo(imageFile.type, imageFile.data);
        setName(imageFile.name);
        setImageUrl(image.url);
        setSize(image.size);
      })();
    }
  }, [imageFile, setImageUrl, setSize]);
  const handleLoadImage = (file: File) => {
    void (async () => {
      const buffer = await file.arrayBuffer();
      const image = await getImageInfo(file.type, buffer);
      setName(file.name);
      setImageUrl(image.url);
      setSize(image.size);
      await save({
        name: file.name,
        type: file.type,
        loadedAt: Date.now(),
        data: buffer,
      });
    })();
  };
  return (
    <FileInput
      disabled={status === "loading"}
      onLoad={handleLoadImage}
      extensions={[".png", "jpg", "jpeg"]}
    >
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
  );
};
async function getImageInfo(
  fileType: string,
  buffer: ArrayBuffer,
): Promise<Image> {
  const blob = new Blob([buffer], { type: fileType });
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
    img.src = URL.createObjectURL(blob);
  });
}
