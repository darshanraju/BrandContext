import type { Shortcut } from "../shared/types";
import { isHexColor } from "../shared/colorDetect";

const DROPDOWN_ID = "bk-dropdown";
let currentOnSelect: ((s: Shortcut) => void) | null = null;
let items: Shortcut[] = [];
let selectedIndex = 0;

function getOrCreate(): HTMLDivElement {
  let el = document.getElementById(DROPDOWN_ID) as HTMLDivElement | null;
  if (!el) {
    el = document.createElement("div");
    el.id = DROPDOWN_ID;
    injectStyles();
    document.body.appendChild(el);
  }
  return el;
}

function injectStyles() {
  if (document.getElementById("bk-styles")) return;
  const style = document.createElement("style");
  style.id = "bk-styles";
  style.textContent = `
    #bk-dropdown {
      position: fixed; z-index: 2147483647; width: 280px;
      background: #FFFFFF; border: 1px solid #E5E5E5; border-radius: 10px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px; letter-spacing: -0.15px; overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06);
      display: flex; flex-direction: column;
    }
    .bk-list {
      overflow-y: auto; max-height: 224px; padding: 3px;
      scrollbar-width: thin; scrollbar-color: #E5E5E5 transparent;
    }
    .bk-list::-webkit-scrollbar { width: 4px; }
    .bk-list::-webkit-scrollbar-track { background: transparent; }
    .bk-list::-webkit-scrollbar-thumb { background: #E0E0E0; border-radius: 4px; }
    .bk-item {
      display: flex; align-items: center; gap: 8px;
      height: 28px; padding: 0 8px;
      border-radius: 6px; cursor: pointer; transition: background 0.1s;
    }
    .bk-item.bk-active { background: #F2F2F2; }
    .bk-key {
      font-family: 'SF Mono', 'Fira Code', monospace; font-size: 11.5px;
      color: #F97316; min-width: 72px; font-weight: 500; letter-spacing: 0; flex-shrink: 0;
    }
    .bk-swatch {
      width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0;
      border: 1px solid rgba(0,0,0,0.08);
    }
    .bk-val {
      color: #909090; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;
    }
    .bk-hint {
      padding: 4px 10px; border-top: 1px solid #E5E5E5; flex-shrink: 0;
      color: #BBBBBB; font-size: 10px; display: flex; gap: 10px;
    }
    .bk-hint kbd {
      background: #F2F2F2; color: #888; border-radius: 3px; padding: 1px 4px; font-family: inherit;
    }
  `;
  document.head.appendChild(style);
}

function render(el: HTMLDivElement) {
  el.innerHTML = `
    <div class="bk-list">
      ${items
        .map(
          (s, i) => `
        <div class="bk-item${i === selectedIndex ? " bk-active" : ""}" data-index="${i}">
          <span class="bk-key">@${s.key}</span>
          ${isHexColor(s.value) ? `<div class="bk-swatch" style="background:${s.value}"></div>` : ""}
          <span class="bk-val">${s.value}</span>
        </div>
      `,
        )
        .join("")}
    </div>
    <div class="bk-hint">
      <span><kbd>↑↓</kbd> navigate</span>
      <span><kbd>↵</kbd> insert</span>
      <span><kbd>Esc</kbd> close</span>
    </div>
  `;

  el.querySelectorAll<HTMLElement>(".bk-item").forEach((row, i) => {
    row.addEventListener("mousedown", (e) => {
      e.preventDefault();
      select(i);
    });
  });
}

function scrollActiveIntoView(el: HTMLDivElement) {
  const list = el.querySelector<HTMLElement>(".bk-list");
  const active = el.querySelector<HTMLElement>(".bk-item.bk-active");
  if (list && active) active.scrollIntoView({ block: "nearest" });
}

function position(el: HTMLDivElement, anchorRect: DOMRect) {
  const GAP = 4;
  const dropH = Math.min(items.length * 28 + 32, 256);
  const spaceBelow = window.innerHeight - anchorRect.bottom;
  const top =
    spaceBelow >= dropH + GAP
      ? anchorRect.bottom + GAP
      : anchorRect.top - dropH - GAP;
  el.style.top = `${top + window.scrollY}px`;
  el.style.left = `${Math.min(anchorRect.left, window.innerWidth - 300)}px`;
}

function select(index: number) {
  const shortcut = items[index];
  if (shortcut && currentOnSelect) currentOnSelect(shortcut);
  hide();
}

export function show(
  shortcuts: Shortcut[],
  anchorRect: DOMRect,
  onSelect: (s: Shortcut) => void,
): void {
  items = shortcuts;
  selectedIndex = 0;
  currentOnSelect = onSelect;
  // Returns the new DOM node to render the dropdown in. Creates if doesn't exist
  const el = getOrCreate();
  el.style.display = "block";
  render(el);
  position(el, anchorRect);
}

export function hide(): void {
  const el = document.getElementById(DROPDOWN_ID);
  if (el) el.style.display = "none";
  currentOnSelect = null;
}

export function isVisible(): boolean {
  const el = document.getElementById(DROPDOWN_ID);
  return el !== null && el.style.display !== "none";
}

export function moveSelection(delta: 1 | -1): void {
  if (!items.length) return;
  selectedIndex = (selectedIndex + delta + items.length) % items.length;
  const el = document.getElementById(DROPDOWN_ID) as HTMLDivElement | null;
  if (el) {
    render(el);
    scrollActiveIntoView(el);
  }
}

export function confirmSelection(): void {
  select(selectedIndex);
}
