import { useCallback, useEffect, useState } from "react";
import { StoredFile } from "./model/types";
import { number, object, string, parse } from "valibot";
import { arrayBufferToBase64, base64ToArrayBuffer } from "./model/base64";

const fileDataSchema = object({
  name: string(),
  type: string(),
  loadedAt: number(),
  data: string(),
});

export const useFileStorage = (id: string) => {
  const [status, setStatus] = useState<null | "loading" | "ready" | "error">(
    null,
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
    if (status !== null) {
      return;
    }
    setStatus("loading");
    openDB((db) => {
      const request = db
        .transaction("files", "readonly")
        .objectStore("files")
        .get(id);
      request.onsuccess = (event: any) => {
        const data = event.target?.result;
        setStatus("ready");
        if (data == null) {
          return;
        }
        const file = parse(fileDataSchema, event.target?.result);
        setData({
          ...file,
          data: base64ToArrayBuffer(file.data),
        });
      };
    });
  }, [status, id, openDB]);

  const save = useCallback(
    (file: StoredFile) => {
      openDB((db) => {
        db.transaction("files", "readwrite")
          .objectStore("files")
          .put({
            ...file,
            data: arrayBufferToBase64(file.data),
            id,
          });
      });
    },
    [id, openDB],
  );
  return { status: status ?? "loading", save, data };
};
