import { importAllLocalRendererModules } from "@/domain/render";
import {
  allRendererPropsAtom,
  rendererAtom,
  rendererModulesAtom,
  selectedRendererAtom,
} from "@/usecase/atoms";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useMemo } from "react";

export const useRendererModules = () => {
  const [rendererModules, setRendererModules] = useAtom(rendererModulesAtom);
  useEffect(() => {
    if (rendererModules != null) {
      return;
    }
    importAllLocalRendererModules()
      .then((modules) => {
        setRendererModules(modules);
      })
      .catch((e) => {
        console.error(e);
      });
  }, [rendererModules, setRendererModules]);

  const sortedRendererModules = useMemo(() => {
    if (rendererModules == null) {
      return null;
    }
    return [...rendererModules].sort((a, b) => a.meta.index - b.meta.index);
  }, [rendererModules]);

  return sortedRendererModules;
};

export const useRendererSettingsDeleter = () => {
  const rendererModules = useRendererModules() ?? [];
  const [allRendererProps, setAllRendererProps] = useAtom(allRendererPropsAtom);
  const deleteRendererProps = useCallback(
    (rendererName: string) => {
      const { [rendererName]: _, ...newProps } = allRendererProps;
      setAllRendererProps(newProps);
    },
    [allRendererProps, setAllRendererProps],
  );
  const rendererNamesWhichHaveProps = useMemo(
    () => rendererModules.filter((m) => allRendererProps[m.meta.name] != null),
    [rendererModules, allRendererProps],
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
  const rendererModules = useRendererModules();
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
    if (rendererModules == null) {
      return;
    }
    const module = rendererModules.find(
      (m) => m.meta.name === selectedRenderer,
    );
    if (module == null) {
      console.error(`Renderer ${selectedRenderer} not found`);
      return;
    }
    setRenderer({ type: "Ready", module });
  }, [renderer, rendererModules, selectedRenderer, setRenderer]);

  return {
    selectedRenderer,
    selectRenderer,
  };
};
