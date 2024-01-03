import { StoredFile } from "../domain/types";
import { number, object, string, parse } from "valibot";
import { arrayBufferToBase64, base64ToArrayBuffer } from "../domain/base64";

const dbName = "midi-movie";
const storeName = "files";

const fileDataSchema = object({
  name: string(),
  type: string(),
  loadedAt: number(),
  data: string(),
});

const openDB = <T>(cb: (db: IDBDatabase) => Promise<T> | T) => {
  return new Promise<T>((resolve, reject) => {
    const request = window.indexedDB.open(dbName, 1);
    request.onerror = (event) => {
      reject(event);
    };
    request.onsuccess = async () => {
      const db = request.result;
      try {
        const res = await cb(db);
        resolve(res);
      } finally {
        db.close();
      }
    };
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore(storeName, { keyPath: "id" });
    };
  });
};

const openTransaction = (
  db: IDBDatabase,
  mode: "readonly" | "readwrite",
  cb: (transaction: IDBTransaction) => IDBRequest,
) => {
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    transaction.onerror = (event) => {
      reject(event);
    };
    const req = cb(transaction);
    req.onsuccess = () => {
      resolve();
    };
  });
};

export const load = async (id: string) => {
  return openDB(async (db) => {
    const request = db
      .transaction(storeName, "readonly")
      .objectStore(storeName)
      .get(id);
    return new Promise<StoredFile | null>((resolve, reject) => {
      request.onerror = (event) => {
        reject(event);
      };
      request.onsuccess = (event: any) => {
        const data = event.target?.result;
        if (data == null) {
          resolve(null);
          return;
        }
        const file = parse(fileDataSchema, event.target?.result);
        resolve({
          ...file,
          data: base64ToArrayBuffer(file.data),
        });
      };
    });
  });
};

export const save = async (id: string, file: StoredFile) => {
  return openDB(async (db) => {
    await openTransaction(db, "readwrite", (transaction) => {
      return transaction.objectStore(storeName).put({
        ...file,
        data: arrayBufferToBase64(file.data),
        id,
      });
    });
  });
};

export const clear = async () => {
  return openDB(async (db) => {
    await openTransaction(db, "readwrite", (transaction) => {
      return transaction.objectStore(storeName).clear();
    });
  });
};
