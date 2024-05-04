import { FileInput } from "@/ui/FileInput";
import { useCounter } from "@/counter";
import { useImageLoader } from "@/usecase/image";

export const ImageLoader = () => {
  useCounter("ImageLoader");
  const { name, imageUrl, size, status, loadImage } = useImageLoader();
  return (
    <FileInput
      disabled={status === "loading"}
      onLoad={loadImage}
      extensions={[".png", ".jpg", ".jpeg"]}
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
