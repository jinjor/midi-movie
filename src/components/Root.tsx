import { Provider } from "jotai";
import { App } from "./App";

export const Root = () => {
  return (
    <Provider>
      <App />
    </Provider>
  );
};
