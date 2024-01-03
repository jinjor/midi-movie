import { importRendererModule, renderers } from "@/domain/render";
import {
  allRendererPropsAtom,
  rendererAtom,
  selectedRendererAtom,
} from "@/usecase/atoms";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect } from "react";

export const useRendererNames = () => {
  return renderers.map((r) => r.name);
};

export const useRenderer = () => {
  const renderer = useAtomValue(rendererAtom);
  const selectedRenderer = useAtomValue(selectedRendererAtom);
  const [allRendererProps, setAllRendererProps] = useAtom(allRendererPropsAtom);
  const props = allRendererProps[selectedRenderer];

  const setProps = useCallback(
    (props: Record<string, number>) => {
      if (renderer.type !== "Ready") {
        return;
      }
      setAllRendererProps({
        ...allRendererProps,
        [selectedRenderer]: props,
      });
    },
    [renderer, allRendererProps, selectedRenderer, setAllRendererProps],
  );

  return {
    renderer,
    selectedRenderer,
    props,
    setProps,
  };
};

export const useRendererUpdater = () => {
  const { renderer, props, setProps } = useRenderer();
  const setProp = useCallback(
    (key: string, value: number) => {
      setProps({
        ...props,
        [key]: value,
      });
    },
    [props, setProps],
  );
  return {
    renderer,
    props,
    setProp,
  };
};

export const useRendererLoader = () => {
  const [renderer, setRenderer] = useAtom(rendererAtom);
  const [selectedRenderer, setSelectedRenderer] = useAtom(selectedRendererAtom);
  const [allRendererProps, setAllRendererProps] = useAtom(allRendererPropsAtom);

  const selectRenderer = useCallback(
    (name: string) => {
      setSelectedRenderer(name);
      setRenderer({ type: "Loading" });
    },
    [setSelectedRenderer, setRenderer],
  );

  useEffect(() => {
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
  ]);

  return {
    selectedRenderer,
    selectRenderer,
  };
};
