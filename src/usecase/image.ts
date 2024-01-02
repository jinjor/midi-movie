import { useAtom } from "jotai";
import { opacityAtom } from "./atoms";

export const useImageSettings = () => {
  const [opacity, setOpacity] = useAtom(opacityAtom);
  return {
    opacity,
    setOpacity,
  };
};
