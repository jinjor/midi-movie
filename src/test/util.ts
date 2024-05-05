import { act, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";

const randomId = () => Math.random().toString(36).substring(7);

export const renderInNewContainer = (node: ReactNode) => {
  const container = document.createElement("div");
  container.setAttribute("id", randomId());
  document.body.appendChild(container);
  act(() => {
    createRoot(container).render(node);
  });
  return within(container);
};
