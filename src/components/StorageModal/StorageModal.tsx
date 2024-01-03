import { useCounter } from "@/counter";
import { Modal } from "@/ui/Modal";
import { useRendererSettingsDeleter } from "@/usecase/renderer";
import styles from "./StorageModal.module.css";
import { useMidiSettingsDeleter } from "@/usecase/midi";

export const StorageModal = () => {
  useCounter("StorageModal");
  return (
    <Modal
      title="Storage"
      renderButton={(open) => <button onClick={open}>Storage</button>}
    >
      <RendererList />
      <MidiList />
    </Modal>
  );
};

const RendererList = () => {
  useCounter("RendererList");
  const { rendererNamesWhichHaveProps, deleteRendererProps } =
    useRendererSettingsDeleter();
  if (rendererNamesWhichHaveProps.length === 0) {
    return null;
  }
  return (
    <div>
      <h3>Renderer Settings</h3>
      <ul className={styles.list}>
        {rendererNamesWhichHaveProps.map((name) => (
          <li key={name} className={styles.item}>
            {name}
            <button onClick={() => deleteRendererProps(name)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const MidiList = () => {
  useCounter("MidiList");
  const { midiFileNamesWhichHaveProps, deleteMidiProps } =
    useMidiSettingsDeleter();
  if (midiFileNamesWhichHaveProps.length === 0) {
    return null;
  }
  return (
    <div>
      <h3>Midi Settings</h3>
      <ul className={styles.list}>
        {midiFileNamesWhichHaveProps.map((name) => (
          <li key={name} className={styles.item}>
            {name}
            <button onClick={() => deleteMidiProps(name)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
