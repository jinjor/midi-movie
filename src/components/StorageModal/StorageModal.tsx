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
      className={styles.modal}
    >
      <div className={styles.sections}>
        <RendererList />
        <MidiList />
      </div>
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

const MidiList = () => {
  useCounter("MidiList");
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
