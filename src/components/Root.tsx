import { Provider } from "jotai";
import { App } from "./App";
import { store } from "@/atoms";

export const Root = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};
