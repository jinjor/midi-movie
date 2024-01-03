import { useCounter } from "@/counter";
import { Modal } from "@/ui/Modal";
import {
  useRendererNames,
  useRendererSettingsDeleter,
} from "@/usecase/renderer";
import styles from "./StorageModal.module.css";

export const StorageModal = () => {
  useCounter("StorageModal");
  const rendererNames = useRendererNames();
  const { deleteRendererProps } = useRendererSettingsDeleter();
  return (
    <Modal
      title="Storage"
      renderButton={(open) => <button onClick={open}>Storage</button>}
    >
      <ul className={styles.list}>
        {rendererNames.map((name) => (
          <li key={name} className={styles.item}>
            {name}
            <button onClick={() => deleteRendererProps(name)}>Delete</button>
          </li>
        ))}
      </ul>
    </Modal>
  );
};
