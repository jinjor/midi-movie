import { useCounter } from "@/counter";
import { ReactNode, useCallback, useState } from "react";
import { Portal } from "../Portal";
import styles from "./Modal.module.css";

export const Modal = ({
  title,
  renderButton,
  children,
}: {
  title: string;
  renderButton: (open: () => void) => ReactNode;
  children: ReactNode;
}) => {
  useCounter("Modal");
  const [show, setShow] = useState(false);
  const open = useCallback(() => {
    setShow(true);
  }, []);
  return (
    <>
      {renderButton(open)}
      {show && (
        <Portal>
          <div className={styles.modal}>
            <div
              className={styles.overlay}
              onMouseDown={() => {
                setShow(false);
              }}
            />
            <div className={styles.content}>
              <div className={styles.header}>
                <div className={styles.title}>{title}</div>
                <button
                  onClick={() => {
                    setShow(false);
                  }}
                >
                  x
                </button>
              </div>
              <div className={styles.body}>{children}</div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};
