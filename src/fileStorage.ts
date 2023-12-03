import { useCallback, useEffect, useState } from "react";
import { StoredFile } from "./model/types";
import { number, object, string, parse } from "valibot";

const fileDataSchema = object({
  name: string(),
  type: string(),
  loadedAt: number(),
  data: string(),
});

export const useFileStorage = (id: string) => {
  const [status, setStatus] = useState<"init" | "loading" | "ready" | "error">(
    "init",
  );
  const [data, setData] = useState<StoredFile | null>(null);
  const openDB = useCallback(
    (cb: (db: IDBDatabase) => Promise<void> | void) => {
      const request = window.indexedDB.open("midi-movie", 1);
      request.onerror = (event) => {
        console.log(event);
        setStatus("error");
      };
      request.onsuccess = async () => {
        const db = request.result;
        try {
          await cb(db);
        } catch (e) {
          console.log(e);
          setStatus("error");
        } finally {
          db.close();
        }
      };
      request.onupgradeneeded = () => {
        const db = request.result;
        db.createObjectStore("files", { keyPath: "id" });
      };
    },
    [],
  );

  useEffect(() => {
    if (status !== "init") {
      return;
    }
    openDB((db) => {
      const request = db
        .transaction("files", "readonly")
        .objectStore("files")
        .get(id);
      request.onsuccess = (event: any) => {
        const file = parse(fileDataSchema, event.target?.result);
        setStatus("ready");
        setData(file);
      };
    });
  }, [status, id, openDB]);

  const save = useCallback(
    (file: StoredFile) => {
      openDB((db) => {
        db.transaction("files", "readwrite")
          .objectStore("files")
          .put({
            id,
            ...file,
          });
      });
    },
    [id, openDB],
  );
  return { status, save, data };
};
