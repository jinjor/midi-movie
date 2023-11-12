import { Provider } from "jotai";
import { App } from "./App";
import { createStoreWithStorage } from "@/atoms";

export const Root = () => {
  const store = createStoreWithStorage();
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};
