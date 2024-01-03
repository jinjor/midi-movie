import styles from "./App.module.css";

import { MidiLoader } from "../MidiLoader";
import { RendererSettings } from "../RendererSettings";
import { Player } from "../Player";
import { cx } from "../../util";
import { useCounter } from "@/counter";
import { AudioLoader } from "../AudioLoader";
import { ImageLoader } from "../ImageLoader";
import { MidiSettings } from "../MidiSettings";
import { ControlLabel } from "@/ui/ControlLabel";
import { PlayerSettings } from "../PlayerSettings";
import { StorageModal } from "../StorageModal";

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
        <StorageModal className={styles.storage} />
      </div>
      <div className={styles.body}>
        <div className={cx(styles.pane)}>
          <Player />
        </div>
        <div className={cx(styles.pane, styles.rows)}>
          <PlayerSettings />
          <RendererSettings />
        </div>
        <div className={cx(styles.pane)}>
          <MidiSettings />
        </div>
      </div>
    </div>
  );
};
