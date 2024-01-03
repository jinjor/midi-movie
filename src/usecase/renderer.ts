import { importRendererModule, renderers } from "@/domain/render";
import {
  allRendererPropsAtom,
  rendererAtom,
  selectedRendererAtom,
} from "@/usecase/atoms";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useMemo } from "react";

export const useRendererNames = () => {
  return renderers.map((r) => r.name);
};

export const useRendererSettingsDeleter = () => {
  const rendererNames = useRendererNames();
  const [allRendererProps, setAllRendererProps] = useAtom(allRendererPropsAtom);
  const deleteRendererProps = useCallback(
    (rendererName: string) => {
      const { [rendererName]: _, ...newProps } = allRendererProps;
      setAllRendererProps(newProps);
    },
    [allRendererProps, setAllRendererProps],
  );
  const rendererNamesWhichHaveProps = useMemo(
    () => rendererNames.filter((name) => allRendererProps[name] != null),
    [rendererNames, allRendererProps],
  );
  return {
    rendererNamesWhichHaveProps,
    deleteRendererProps,
  };
};

export const useRenderer = () => {
  const renderer = useAtomValue(rendererAtom);
  const selectedRenderer = useAtomValue(selectedRendererAtom) ?? "Pianoroll";
  const [allRendererProps, setAllRendererProps] = useAtom(allRendererPropsAtom);

  const props = useMemo(() => {
    const props = { ...allRendererProps[selectedRenderer] };
    for (const prop of renderer.module?.config.props ?? []) {
      props[prop.id] = props[prop.id] ?? prop.defaultValue;
    }
    return props;
  }, [renderer, allRendererProps, selectedRenderer]);

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
  const [selectedRenderer = "Pianoroll", setSelectedRenderer] =
    useAtom(selectedRendererAtom);

  const selectRenderer = useCallback(
    (name: string | undefined) => {
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
        setRenderer({ type: "Ready", module });
      } catch (e) {
        console.error(e);
        setRenderer({ type: "Error" });
      }
    })();
  }, [renderer, selectedRenderer, setRenderer]);

  return {
    selectedRenderer,
    selectRenderer,
  };
};
