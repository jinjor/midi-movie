import { importRendererModule } from "@/domain/render";
import {
  allRendererPropsAtom,
  renderersAtom,
  selectedRendererAtom,
} from "@/usecase/atoms";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useMemo } from "react";

const useRenderers = () => {
  const [renderers, setRenderers] = useAtom(renderersAtom);

  useEffect(() => {
    const completed = renderers.every((m) => m.state.type !== "Loading");
    if (completed) {
      return;
    }
    Promise.allSettled(
      renderers.map(({ info }) => importRendererModule(info.url)),
    ).then((results) => {
      setRenderers(
        results.map((result, i) => {
          return {
            info: renderers[i].info,
            state:
              result.status === "fulfilled"
                ? { type: "Ready", module: result.value }
                : { type: "Error" },
          };
        }),
      );
    });
  }, [renderers, setRenderers]);

  const sortedRenderers = useMemo(() => {
    return renderers
      .filter(({ state }) => state.type === "Ready")
      .sort(
        (a, b) =>
          (a.state.module?.meta.index ?? 9999) -
          (b.state.module?.meta.index ?? 9999),
      );
  }, [renderers]);

  return sortedRenderers;
};

export const useRendererModules = () => {
  const renderers = useRenderers();
  const rendererModules = useMemo(
    () => renderers.flatMap((r) => r.state.module ?? []),
    [renderers],
  );
  return rendererModules;
};

export const useRendererSettingsDeleter = () => {
  const rendererModules = useRendererModules();
  const [allRendererProps, setAllRendererProps] = useAtom(allRendererPropsAtom);
  const deleteRendererProps = useCallback(
    (rendererName: string) => {
      const { [rendererName]: _, ...newProps } = allRendererProps;
      setAllRendererProps(newProps);
    },
    [allRendererProps, setAllRendererProps],
  );
  const rendererNamesWhichHaveProps = useMemo(
    () =>
      rendererModules
        .filter((m) => allRendererProps[m.meta.name] != null)
        .map((m) => m.meta.name),
    [rendererModules, allRendererProps],
  );
  return {
    rendererNamesWhichHaveProps,
    deleteRendererProps,
  };
};

export const useRenderer = () => {
  const renderers = useRenderers();
  const selectedRenderer = useAtomValue(selectedRendererAtom) ?? "Pianoroll";
  const [allRendererProps, setAllRendererProps] = useAtom(allRendererPropsAtom);
  const renderer = useMemo(() => {
    return (
      renderers.find((r) => r.state.module?.meta.name === selectedRenderer)
        ?.state ?? null
    );
  }, [renderers, selectedRenderer]);

  const props = useMemo(() => {
    const props = { ...allRendererProps[selectedRenderer] };
    for (const prop of renderer?.module?.config.props ?? []) {
      props[prop.id] = props[prop.id] ?? prop.defaultValue;
    }
    return props;
  }, [renderer, allRendererProps, selectedRenderer]);

  const setProps = useCallback(
    (props: Record<string, number>) => {
      if (renderer?.type !== "Ready") {
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
  const [selectedRenderer = "Pianoroll", setSelectedRenderer] =
    useAtom(selectedRendererAtom);
  return {
    selectedRenderer,
    selectRenderer: setSelectedRenderer,
  };
};
