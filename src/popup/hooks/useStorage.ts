import { useState, useEffect } from "react";
import type { StorageState } from "../../shared/types";
import { getState } from "../../shared/storage";

// Get and store state. Sync whenever something is updated in chrome extension storage
export function useStorage(): StorageState | null {
  const [state, setState] = useState<StorageState | null>(null);

  useEffect(() => {
    getState().then(setState);

    const listener = () => {
      getState().then(setState);
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  return state;
}
