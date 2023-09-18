import styles from "./App.module.css";

import { Tracks } from "../Tracks";
import { ImageLoader } from "../ImageLoader";
import { AudioLoader } from "../AudioLoader";
import { MidiLoader } from "../MidiLoader";
import { Properties } from "../Properties";
import { Player } from "../Player";
import { cx } from "../../util";
import { useCounter } from "@/counter";

export const App = () => {
  useCounter("App");
  return (
    <div className={styles.panes}>
      <div className={cx(styles.pane, styles.resourcePane, styles.fields)}>
        <MidiLoader />
        <ImageLoader />
        <AudioLoader />
      </div>
      <div className={cx(styles.pane, styles.trackPane)}>
        <Tracks />
      </div>
      <div className={cx(styles.pane, styles.playerPane)}>
        <Player />
      </div>
      <div className={cx(styles.pane, styles.propertyPane, styles.fields)}>
        <Properties />
      </div>
    </div>
  );
};
