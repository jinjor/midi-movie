import { useCallback, useEffect, useState } from "react";
import { StoredFile } from "../model/types";
import { number, object, string, parse } from "valibot";
import { arrayBufferToBase64, base64ToArrayBuffer } from "../model/base64";

const dbName = "midi-movie";
const storeName = "files";

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
    (
      cb: (db: IDBDatabase) => Promise<void> | void,
      onError?: (e: unknown) => void,
    ) => {
      const request = window.indexedDB.open(dbName, 1);
      request.onerror = (event) => {
        console.log(event);
        setStatus("error");
        onError?.(event);
      };
      request.onsuccess = async () => {
        const db = request.result;
        try {
          await cb(db);
        } finally {
          db.close();
        }
      };
      request.onupgradeneeded = () => {
        const db = request.result;
        db.createObjectStore(storeName, { keyPath: "id" });
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
        .transaction(storeName, "readonly")
        .objectStore(storeName)
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
    (file: StoredFile) =>
      new Promise<void>((resolve, reject) => {
        openDB((db) => {
          const req = db
            .transaction(storeName, "readwrite")
            .objectStore(storeName)
            .put({
              ...file,
              data: arrayBufferToBase64(file.data),
              id,
            });
          req.onsuccess = () => {
            resolve();
          };
        }, reject);
      }),
    [id, openDB],
  );
  return { status: status ?? "loading", save, data };
};
