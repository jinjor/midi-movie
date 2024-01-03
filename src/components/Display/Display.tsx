import { useEffect, useRef } from "react";
import { Size } from "@/domain/types";
import styles from "./Display.module.css";
import { useImageSettings } from "@/usecase/image";

export type DisplayApi = {
  getContainer: () => SVGSVGElement;
};

type Props = {
  size: Size;
  imageUrl: string | null;
  onMount: (api: DisplayApi) => void;
};

export const Display = ({ onMount, size, imageUrl }: Props) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { opacity } = useImageSettings();
  useEffect(() => {
    onMount({
      getContainer: () => {
        return svgRef.current!;
      },
    });
  }, [onMount]);
  return (
    <svg
      className={styles.display}
      ref={svgRef}
      width={size.width}
      height={size.height}
      style={{
        backgroundImage: imageUrl
          ? `linear-gradient(
          rgba(0, 0, 0, ${opacity}), 
          rgba(0, 0, 0, ${opacity})
        ),url(${imageUrl})`
          : undefined,
      }}
    />
  );
};
