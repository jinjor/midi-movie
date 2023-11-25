import styles from "./App.module.css";

import { MidiLoader } from "../MidiLoader";
import { RenderingSettings } from "../RenderingSettings/RenderingSettings";
import { Player } from "../Player";
import { cx } from "../../util";
import { useCounter } from "@/counter";
import { Settings } from "../Settings";

export const App = () => {
  useCounter("App");
  return (
    <div className={styles.vertical}>
      <div className={cx(styles.pane, styles.fields)}>
        <MidiLoader />
      </div>
      <div className={styles.panes}>
        <div className={cx(styles.pane)}>
          <Settings />
        </div>
        <div className={cx(styles.pane)}>
          <Player />
        </div>
        <div className={cx(styles.pane, styles.fields)}>
          <RenderingSettings />
        </div>
      </div>
    </div>
  );
};
