import { useCounter } from "@/counter";
import { Modal } from "@/ui/Modal";
import { useRendererSettingsDeleter } from "@/usecase/renderer";
import styles from "./StorageModal.module.css";
import { useMidiSettingsDeleter } from "@/usecase/midi";
import {
  useFileSettingsDeleter,
  usePlayerSettingsDeleter,
} from "@/usecase/globalSettings";

export const StorageModal = ({
  className,
}: {
  className?: string;
}) => {
  useCounter("StorageModal");

  return (
    <Modal
      title="Storage"
      renderButton={(open) => (
        <button className={className} onClick={open}>
          Storage
        </button>
      )}
      className={styles.modal}
    >
      <div className={styles.sections}>
        <GlobalSettings />
        <RendererSettings />
        <MidiSettings />
      </div>
      <div className={styles.empty}>No settings</div>
    </Modal>
  );
};

const GlobalSettings = () => {
  useCounter("GlobalSettings");
  const { hasFileSettings, deleteFileSettings } = useFileSettingsDeleter();
  const { hasPlayerSettings, deletePlayerProps } = usePlayerSettingsDeleter();
  if (!hasFileSettings && !hasPlayerSettings) {
    return null;
  }
  return (
    <section>
      <h3 className={styles.heading}>Global Settings</h3>
      <ul className={styles.list}>
        {hasFileSettings && (
          <li key="file" className={styles.item}>
            <span className={styles.itemName}>File</span>
            <button onClick={deleteFileSettings}>Delete</button>
          </li>
        )}
        {hasPlayerSettings && (
          <li key="player" className={styles.item}>
            <span className={styles.itemName}>Player</span>
            <button onClick={deletePlayerProps}>Delete</button>
          </li>
        )}
      </ul>
    </section>
  );
};

const RendererSettings = () => {
  useCounter("RendererSettings");
  const { rendererNamesWhichHaveProps, deleteRendererProps } =
    useRendererSettingsDeleter();
  if (rendererNamesWhichHaveProps.length === 0) {
    return null;
  }
  return (
    <section>
      <h3 className={styles.heading}>Renderer Settings</h3>
      <ul className={styles.list}>
        {rendererNamesWhichHaveProps.map((name) => (
          <li key={name} className={styles.item}>
            <span className={styles.itemName}>{name}</span>
            <button onClick={() => deleteRendererProps(name)}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  );
};

const MidiSettings = () => {
  useCounter("MidiSettings");
  const { midiFileNamesWhichHaveProps, deleteMidiProps } =
    useMidiSettingsDeleter();
  if (midiFileNamesWhichHaveProps.length === 0) {
    return null;
  }
  return (
    <section>
      <h3 className={styles.heading}>Midi Settings</h3>
      <ul className={styles.list}>
        {midiFileNamesWhichHaveProps.map((name) => (
          <li key={name} className={styles.item}>
            <span className={styles.itemName}>{name}</span>
            <button onClick={() => deleteMidiProps(name)}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  );
};
