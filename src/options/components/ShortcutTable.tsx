import { useState, useRef, useEffect } from "react";
import type { Brand } from "../../shared/types";
import { getState, updateBrands } from "../../shared/storage";
import { ShortcutTableRow } from "./ShortcutTableRow";
import {
  PlusIcon,
  PencilIcon,
  DownloadIcon,
  UploadIcon,
} from "../../shared/icons";

interface Props {
  brand: Brand | null;
  allBrands: Brand[];
}

export function ShortcutTable({ brand, allBrands }: Props) {
  const [addingRow, setAddingRow] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");
  const [renamingBrand, setRenamingBrand] = useState(false);
  const [brandName, setBrandName] = useState(brand?.name ?? "");
  const [importError, setImportError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const addKeyRef = useRef<HTMLInputElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addingRef = useRef(false);
  const dragIndexRef = useRef<number | null>(null);

  useEffect(() => {
    setBrandName(brand?.name ?? "");
  }, [brand]);
  useEffect(() => {
    if (addingRow) addKeyRef.current?.focus();
  }, [addingRow]);
  useEffect(() => {
    if (renamingBrand) renameRef.current?.focus();
  }, [renamingBrand]);

  async function addShortcut() {
    if (addingRef.current) return;
    addingRef.current = true;
    const k = newKey.trim().replace(/^@/, "");
    const v = newVal.trim();
    if (!k || !v || !brand) {
      addingRef.current = false;
      cancelAdd();
      return;
    }
    const { brands: latest } = await getState();
    const updated = latest.map((b) =>
      b.id === brand.id
        ? { ...b, shortcuts: [...b.shortcuts, { key: k, value: v }] }
        : b,
    );
    await updateBrands(updated);
    setNewKey("");
    setNewVal("");
    setAddingRow(false);
    addingRef.current = false;
  }

  function cancelAdd() {
    setNewKey("");
    setNewVal("");
    setAddingRow(false);
  }

  async function saveBrandName() {
    const name = brandName.trim();
    if (!name || !brand) {
      setRenamingBrand(false);
      setBrandName(brand?.name ?? "");
      return;
    }
    const { brands: latest } = await getState();
    await updateBrands(
      latest.map((b) => (b.id === brand.id ? { ...b, name } : b)),
    );
    setRenamingBrand(false);
  }

  function handleExport() {
    const data = JSON.stringify({ brands: allBrands }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brandkey-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    setImportError(null);
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (
        !parsed ||
        typeof parsed !== "object" ||
        !Array.isArray(parsed.brands)
      ) {
        setImportError("Invalid format — expected { brands: [...] }");
        return;
      }
      const brands: Brand[] = parsed.brands.map((b: Brand) => ({
        id: b.id ?? crypto.randomUUID(),
        name: String(b.name ?? "Unnamed"),
        color: String(b.color ?? "#888888"),
        shortcuts: Array.isArray(b.shortcuts)
          ? b.shortcuts
              .filter(
                (s: { key?: unknown; value?: unknown }) => s.key && s.value,
              )
              .map((s: { key: string; value: string }) => ({
                key: String(s.key),
                value: String(s.value),
              }))
          : [],
      }));
      if (!brands.length) {
        setImportError("No brands found in file");
        return;
      }
      await updateBrands(brands);
    } catch {
      setImportError("Could not parse JSON file");
    }
  }

  // ── Drag-and-drop reordering ──────────────────────────────────────────────

  function onDragStart(index: number) {
    dragIndexRef.current = index;
  }

  function onDragEnter(index: number) {
    if (dragIndexRef.current !== null && dragIndexRef.current !== index) {
      setDragOver(index);
    }
  }

  function onDragLeave() {
    setDragOver(null);
  }

  async function onDrop(dropIndex: number) {
    const fromIndex = dragIndexRef.current;
    dragIndexRef.current = null;
    setDragOver(null);
    if (fromIndex === null || fromIndex === dropIndex || !brand) return;

    const { brands: latest } = await getState();
    const target = latest.find((b) => b.id === brand.id);
    if (!target) return;

    const shortcuts = [...target.shortcuts];
    const [moved] = shortcuts.splice(fromIndex, 1);
    shortcuts.splice(dropIndex, 0, moved);

    await updateBrands(
      latest.map((b) => (b.id === brand.id ? { ...b, shortcuts } : b)),
    );
  }

  function onDragEnd() {
    dragIndexRef.current = null;
    setDragOver(null);
  }

  if (!brand) {
    return (
      <div style={{ padding: 32, color: "var(--subtle)" }}>
        Select a brand or create one to get started.
      </div>
    );
  }

  return (
    <>
      <div className="main-header">
        <div style={{ display: "flex", alignItems: "center" }}>
          {renamingBrand ? (
            <input
              ref={renameRef}
              className="table-edit-input val"
              style={{ fontSize: 16, fontWeight: 600 }}
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveBrandName();
                if (e.key === "Escape") {
                  setRenamingBrand(false);
                  setBrandName(brand.name);
                }
              }}
              onBlur={saveBrandName}
            />
          ) : (
            <>
              <span className="main-title">{brand.name}</span>
              <span className="shortcut-count">
                {brand.shortcuts.length} shortcuts
              </span>
            </>
          )}
        </div>
        <div className="header-actions">
          <button className="btn-sm" onClick={() => setRenamingBrand(true)}>
            <PencilIcon size={13} />
            Rename
          </button>
          <button
            className="btn-sm"
            onClick={handleImportClick}
            title="Import all brands from JSON"
          >
            <UploadIcon size={13} />
            Import
          </button>
          <button
            className="btn-sm"
            onClick={handleExport}
            title="Export all brands as JSON"
          >
            <DownloadIcon size={13} />
            Export
          </button>
          <button className="btn-sm primary" onClick={() => setAddingRow(true)}>
            <PlusIcon size={13} />
            Add shortcut
          </button>
        </div>
      </div>

      {importError && (
        <div
          style={{
            margin: "8px 20px",
            padding: "7px 12px",
            borderRadius: "var(--r-md)",
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "var(--red)",
            fontSize: 12,
          }}
        >
          {importError}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <div className="shortcut-table">
        <div className="table-header">
          <div>Key</div>
          <div>Value</div>
          <div></div>
        </div>
        {brand.shortcuts.map((s, i) => (
          <ShortcutTableRow
            key={s.key}
            shortcut={s}
            brand={brand}
            dragIndex={i}
            isDragOver={dragOver === i}
            onDragStart={() => onDragStart(i)}
            onDragEnter={() => onDragEnter(i)}
            onDragLeave={onDragLeave}
            onDrop={() => onDrop(i)}
            onDragEnd={onDragEnd}
          />
        ))}
        {addingRow && (
          <div
            className="table-row editing"
            style={{ gridTemplateColumns: "1fr auto" }}
          >
            <div className="cell" style={{ gap: 6 }}>
              <input
                ref={addKeyRef}
                className="table-edit-input key"
                value={newKey}
                placeholder="key"
                onChange={(e) => setNewKey(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addShortcut();
                  if (e.key === "Escape") cancelAdd();
                }}
              />
              <input
                className="table-edit-input val"
                value={newVal}
                placeholder="value"
                onChange={(e) => setNewVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addShortcut();
                  if (e.key === "Escape") cancelAdd();
                }}
              />
            </div>
            <div className="cell cell-actions">
              <button className="btn-save" onClick={addShortcut}>
                Add
              </button>
              <button className="btn-cancel" onClick={cancelAdd}>
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="table-add-row" onClick={() => setAddingRow(true)}>
          <PlusIcon size={13} />
          Add shortcut
        </div>
      </div>
    </>
  );
}
