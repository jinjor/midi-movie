import { Provider } from "jotai";
import { App } from "./App";
import { createStoreWithStorage } from "@/usecase/atoms";
import { PortalContainer } from "../ui/Portal";

export const Root = () => {
  const store = createStoreWithStorage();
  return (
    <Provider store={store}>
      <App />
      <PortalContainer />
    </Provider>
  );
};
