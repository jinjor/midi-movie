import { useCallback, useEffect, useState } from "react";
import type { StoredFile } from "../domain/types";
import { load, save } from "@/repository/fileStorage";

export const useFileStorage = (id: string) => {
  const [status, setStatus] = useState<null | "loading" | "ready" | "error">(
    null,
  );
  const [data, setData] = useState<StoredFile | null>(null);

  useEffect(() => {
    if (status !== null) {
      return;
    }
    setStatus("loading");
    load(id)
      .then((data) => {
        setStatus("ready");
        if (data == null) {
          return;
        }
        setData(data);
      })
      .catch(() => {
        setStatus("error");
      });
  }, [status, id]);
  const saveFile = useCallback((file: StoredFile) => save(id, file), [id]);

  return { status: status ?? "loading", saveFile, data };
};
