import styles from "./App.module.css";

import { MidiLoader } from "../MidiLoader";
import { Settings } from "../Settings/Settings";
import { Player } from "../Player";
import { cx } from "../../util";
import { useCounter } from "@/counter";
import { AudioLoader } from "../AudioLoader";
import { ImageLoader } from "../ImageLoader";
import { Tracks } from "../Tracks";
import { ControlLabel } from "@/ui/ControlLabel";

export const App = () => {
  useCounter("App");
  return (
    <div className={styles.App}>
      <div className={cx(styles.pane, styles.files)}>
        <ControlLabel text="MIDI">
          <MidiLoader />
        </ControlLabel>
        <ControlLabel text="Image">
          <ImageLoader />
        </ControlLabel>
        <ControlLabel text="Audio">
          <AudioLoader />
        </ControlLabel>
      </div>
      <div className={styles.body}>
        <div className={cx(styles.pane)}>
          <Player />
        </div>
        <div className={cx(styles.pane)}>
          <Settings />
        </div>
        <div className={cx(styles.pane)}>
          <Tracks />
        </div>
      </div>
    </div>
  );
};
