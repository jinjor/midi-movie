import { FileInput } from "./ui/FileInput";
import { Size } from "./model";

export type Image = {
  imageUrl: string;
  size: Size;
};
type Props = {
  onLoad: (image: Image) => void;
};
export const ImageLoader = ({ onLoad }: Props) => {
  const handleLoadImage = (file: File) => {
    void (async () => {
      const buffer = await file.arrayBuffer();
      const size = await getImageSize(file);
      const blob = new Blob([buffer], { type: file.type });
      const imageUrl = URL.createObjectURL(blob);
      onLoad({ imageUrl, size });
    })();
  };
  return (
    <label>
      <span>Image:</span>
      <FileInput
        onLoad={handleLoadImage}
        extensions={[".png", "jpg", "jpeg"]}
      />
    </label>
  );
};
async function getImageSize(file: File): Promise<Size> {
  return new Promise((resolve, reject) => {
    const img = new Image();

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
