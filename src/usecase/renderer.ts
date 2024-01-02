import {
  allRendererPropsAtom,
  rendererAtom,
  selectedRendererAtom,
} from "@/usecase/atoms";
import { useAtomValue } from "jotai";

export const useRenderer = () => {
  const renderer = useAtomValue(rendererAtom);
  const selectedRenderer = useAtomValue(selectedRendererAtom);
  const allRendererProps = useAtomValue(allRendererPropsAtom);
  const customProps = allRendererProps[selectedRenderer];
  return {
    renderer,
    customProps,
  };
};
