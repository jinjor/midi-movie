import { useCounter } from "@/counter";
import { Modal } from "@/ui/Modal";

export const StorageModal = () => {
  useCounter("StorageModal");
  return (
    <Modal
      title="Storage"
      renderButton={(open) => <button onClick={open}>Storage</button>}
    >
      {""}
    </Modal>
  );
};
