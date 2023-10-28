import { cx } from "@/util";
import * as styles from "./SeekBar.css.ts";
import { useEffect, useRef, useState } from "react";

type Props = {
  disabled: boolean;
  value: number; // 0-1
  onStartDragging: (value: number) => void;
  onStopDragging: (value: number) => void;
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
    const value = (e.clientX - drag.minX) / (drag.maxX - drag.minX);
    setDrag(drag);
    onStartDragging(value);
  };
  useEffect(() => {
    if (drag === null) {
      return;
    }
    const handleMouseMove = (e: MouseEvent) => {
      const value = (e.clientX - drag.minX) / (drag.maxX - drag.minX);
      onDrag(value);
    };
    const handleMouseUp = (e: MouseEvent) => {
      const value = (e.clientX - drag.minX) / (drag.maxX - drag.minX);
      setDrag(null);
      onStopDragging(value);
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
      className={cx(styles.bar, [styles.disabled, disabled])}
      onMouseDown={handleMouseDown}
    >
      <div
        className={styles.progress}
        style={{
          width: `${value * 100}%`,
        }}
      >
        <div className={styles.knob} onMouseDown={handleMouseDown}></div>
      </div>
    </div>
  );
};
