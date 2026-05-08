import type { Brand, StorageState } from "./types";

const DEFAULTS: StorageState = {
  brands: [],
  activeBrandId: null,
  allowedDomains: [],
};

/**
 * Chrome extensions get their own async API's for isolated storage in chrome.storage
 */

export async function getState(): Promise<StorageState> {
  const result = await chrome.storage.sync.get([
    "brands",
    "activeBrandId",
    "allowedDomains",
  ]);
  return {
    brands: (result["brands"] as Brand[] | undefined) ?? DEFAULTS.brands,
    activeBrandId:
      (result["activeBrandId"] as string | null | undefined) ??
      DEFAULTS.activeBrandId,
    allowedDomains:
      (result["allowedDomains"] as string[] | undefined) ??
      DEFAULTS.allowedDomains,
  };
}

export async function setState(partial: Partial<StorageState>): Promise<void> {
  await chrome.storage.sync.set(partial);
}

export async function updateBrands(brands: Brand[]): Promise<void> {
  await chrome.storage.sync.set({ brands });
}
