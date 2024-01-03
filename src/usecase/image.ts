import { useAtom, useAtomValue } from "jotai";
import { imageSizeAtom, imageUrlAtom, opacityAtom } from "./atoms";
import { useCallback, useEffect, useState } from "react";
import { useFileStorage } from "@/repository/fileStorage";
import { Image } from "@/domain/types";

export const useImageData = () => {
  const imageUrl = useAtomValue(imageUrlAtom);
  const size = useAtomValue(imageSizeAtom);
  return {
    imageUrl,
    size,
  };
};

export const useImageSettings = () => {
  const [opacity, setOpacity] = useAtom(opacityAtom);
  return {
    opacity,
    setOpacity,
  };
};

export const useImageLoader = () => {
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
  const loadImage = useCallback(
    (file: File) => {
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
    },
    [setSize, setImageUrl, save],
  );
  return {
    name,
    imageUrl,
    size,
    status,
    loadImage,
  };
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
