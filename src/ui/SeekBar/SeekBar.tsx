import { cx } from "@/util";
import styles from "./SeekBar.module.css";
import { useEffect, useRef, useState } from "react";

type Props = {
  disabled: boolean;
  value: number; // 0-1
  onStartDragging?: (value: number) => void;
  onStopDragging?: (value: number) => void;
  onDrag: (value: number) => void;
};

type DraggingState = {
  minX: number;
  maxX: number;
};

export const SeekBar = ({
  disabled,
  value: originalValue,
  onStartDragging,
  onStopDragging,
  onDrag,
}: Props) => {
  const value = Math.max(0, Math.min(1, originalValue));
  const barRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DraggingState | null>(null);
  const handleMouseDown = (e: React.MouseEvent) => {
    const bounds = barRef.current!.getBoundingClientRect();
    const drag = {
      minX: bounds.left,
      maxX: bounds.right,
    };
    setDrag(drag);
    onStartDragging?.(calculateValue(e.clientX, drag));
  };
  useEffect(() => {
    if (drag === null) {
      return;
    }
    const handleMouseMove = (e: MouseEvent) => {
      onDrag(calculateValue(e.clientX, drag));
    };
    const handleMouseUp = (e: MouseEvent) => {
      setDrag(null);
      onStopDragging?.(calculateValue(e.clientX, drag));
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [drag, onDrag, onStopDragging]);
  return (
    <div
      ref={barRef}
      onMouseDown={handleMouseDown}
      className={cx(styles.SeekBar, [styles.disabled, disabled])}
    >
      <div className={styles.bar}>
        <div
          className={styles.progress}
          style={{
            width: `${value * 100}%`,
          }}
        >
          <div className={styles.knob} onMouseDown={handleMouseDown} />
        </div>
      </div>
    </div>
  );
};

const calculateValue = (clientX: number, drag: DraggingState) => {
  return Math.min(
    1,
    Math.max(0, (clientX - drag.minX) / (drag.maxX - drag.minX)),
  );
};
