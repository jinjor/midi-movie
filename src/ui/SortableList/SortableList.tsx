import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCounter } from "@/counter";
import styles from "./SortableList.module.css";
import { cx } from "@/util";

export const SortableList = <T,>(props: {
  className?: string;
  items: T[];
  onSort: (items: T[]) => void;
  getKey: (item: T) => string | number;
  renderItem: (item: T) => React.ReactNode;
}) => {
  useCounter("SortableList");
  const { className, items, onSort, getKey, renderItem } = props;
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLUListElement>(null);

  const temporarySortedItems = useMemo(() => {
    if (draggingIndex == null || dragOverIndex == null) {
      return items;
    }
    const newSortedTracks = [...items];
    newSortedTracks.splice(
      dragOverIndex,
      0,
      ...newSortedTracks.splice(draggingIndex, 1),
    );
    return newSortedTracks;
  }, [draggingIndex, dragOverIndex, items]);
  const handleMouseDown = useCallback((index: number) => {
    setDraggingIndex(index);
  }, []);
  const handleMouseUp = useCallback(
    (e: React.MouseEvent<unknown>) => {
      e.stopPropagation();
      setDraggingIndex(null);
      setDragOverIndex(null);
      onSort(temporarySortedItems);
    },
    [onSort, temporarySortedItems],
  );
  const handleMouseEnter = useCallback(
    (index: number) => {
      if (draggingIndex != null) {
        setDragOverIndex(index);
      }
    },
    [draggingIndex],
  );
  const handleMourLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);
  useEffect(() => {
    const handleMouseUp = () => {
      setDraggingIndex(null);
      setDragOverIndex(null);
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);
  return (
    <ul
      className={className}
      ref={containerRef}
      onMouseLeave={handleMourLeave}
      onMouseUp={handleMouseUp}
    >
      {temporarySortedItems.map((item, i) => (
        <li
          className={cx(
            styles.item,
            i === (dragOverIndex ?? draggingIndex) ? styles.itemDragging : null,
          )}
          key={getKey(item)}
          onMouseEnter={() => handleMouseEnter(i)}
        >
          <div className={styles.grip}>
            <span>::</span>
            <div
              className={styles.gripHandle}
              onMouseDown={() => handleMouseDown(i)}
            />
          </div>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
};
