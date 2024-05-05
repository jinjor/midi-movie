import { useCounter } from "@/counter";
import { type ReactNode, useCallback, useState } from "react";
import { Portal } from "../Portal";
import styles from "./Modal.module.css";
import { cx } from "@/util";

export const Modal = ({
  className,
  title,
  renderButton,
  children,
}: {
  className?: string;
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
            <div className={cx(styles.content, className)}>
              <div className={styles.head}>
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
