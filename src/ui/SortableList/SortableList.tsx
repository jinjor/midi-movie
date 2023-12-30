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
  const handleMouseUp = useCallback(() => {
    setDraggingIndex(null);
  }, []);
  const handleDragStart = useCallback(
    (e: React.DragEvent<unknown>, index: number) => {
      e.dataTransfer.dropEffect = "move";
      e.dataTransfer.effectAllowed = "move";
      setDraggingIndex(index);
    },
    [],
  );
  const handleDragEnter = useCallback((index: number) => {
    setDragOverIndex(index);
  }, []);
  const handleDragOver = useCallback(
    (e: React.DragEvent<unknown>, index: number) => {
      e.preventDefault();
      setDragOverIndex(index);
    },
    [],
  );
  const handleDrop = useCallback(
    (e: React.DragEvent<unknown>) => {
      e.stopPropagation();
      setDraggingIndex(null);
      setDragOverIndex(null);
      onSort(temporarySortedItems);
    },
    [temporarySortedItems, onSort],
  );
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (containerRef.current?.contains(e.target as Node)) {
        return;
      }
      setDragOverIndex(null);
    };
    const handleDragEnd = () => {
      setDraggingIndex(null);
      setDragOverIndex(null);
    };
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragend", handleDragEnd);
    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragend", handleDragEnd);
    };
  }, []);
  return (
    <ul
      className={className}
      ref={containerRef}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {temporarySortedItems.map((item, i) => (
        <li
          className={cx(
            styles.item,
            i === (dragOverIndex ?? draggingIndex) ? styles.itemDragging : null,
          )}
          key={getKey(item)}
          onDragEnter={() => handleDragEnter(i)}
          onDragOver={(e) => handleDragOver(e, i)}
        >
          <div className={styles.grip}>
            <span>::</span>
            <div
              className={styles.gripHandle}
              draggable
              onMouseDown={() => handleMouseDown(i)}
              onMouseUp={handleMouseUp}
              onDragStart={(e) => handleDragStart(e, i)}
            />
          </div>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
};
