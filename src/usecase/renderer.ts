import { importRendererModule, renderers } from "@/domain/render";
import {
  allRendererPropsAtom,
  rendererAtom,
  selectedRendererAtom,
} from "@/usecase/atoms";
import { useAtom } from "jotai";
import { useCallback, useEffect } from "react";

export const useRenderer = (loadEffect = false) => {
  const [renderer, setRenderer] = useAtom(rendererAtom);
  const [selectedRenderer, setSelectedRenderer] = useAtom(selectedRendererAtom);
  const [allRendererProps, setAllRendererProps] = useAtom(allRendererPropsAtom);
  const props = allRendererProps[selectedRenderer];

  const selectRenderer = useCallback(
    (name: string) => {
      setSelectedRenderer(name);
      setRenderer({ type: "Loading" });
    },
    [setSelectedRenderer, setRenderer],
  );
  const setProp = useCallback(
    (key: string, value: number) => {
      if (renderer.type !== "Ready") {
        return;
      }
      setAllRendererProps({
        ...allRendererProps,
        [selectedRenderer]: {
          ...allRendererProps[selectedRenderer],
          [key]: value,
        },
      });
    },
    [renderer, allRendererProps, selectedRenderer, setAllRendererProps],
  );

  useEffect(() => {
    if (!loadEffect) {
      return;
    }
    if (renderer.type !== "Loading") {
      return;
    }
    const info = renderers.find((r) => r.name === selectedRenderer);
    if (info == null) {
      console.error(`Renderer ${selectedRenderer} not found`);
      return;
    }
    void (async () => {
      try {
        const module = await importRendererModule(info.url);
        const props = { ...allRendererProps[selectedRenderer] };
        for (const prop of module.config.props) {
          props[prop.id] = props[prop.id] ?? prop.defaultValue;
        }
        setRenderer({ type: "Ready", module });
        setAllRendererProps({ ...allRendererProps, [selectedRenderer]: props });
      } catch (e) {
        console.error(e);
        setRenderer({ type: "Error" });
      }
    })();
  }, [
    allRendererProps,
    renderer,
    selectedRenderer,
    setAllRendererProps,
    setRenderer,
    loadEffect,
  ]);

  return {
    renderer,
    selectedRenderer,
    props,
    selectRenderer,
    setProp,
  };
};
