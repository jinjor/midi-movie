import styles from "./App.module.css";

import { MidiLoader } from "../MidiLoader";
import { Settings } from "../Settings/Settings";
import { Player } from "../Player";
import { cx } from "../../util";
import { useCounter } from "@/counter";
import { AudioLoader } from "../AudioLoader";
import { ImageLoader } from "../ImageLoader";
import { Tracks } from "../Tracks";

export const App = () => {
  useCounter("App");
  return (
    <div className={styles.vertical}>
      <div className={cx(styles.pane, styles.fields)}>
        <MidiLoader />
        <ImageLoader />
        <AudioLoader />
      </div>
      <div className={styles.panes}>
        <div className={cx(styles.pane)}>
          <Tracks />
        </div>
        <div className={cx(styles.pane)}>
          <Player />
        </div>
        <div className={cx(styles.pane, styles.fields)}>
          <Settings />
        </div>
      </div>
    </div>
  );
};
