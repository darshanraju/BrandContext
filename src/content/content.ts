import type { StorageState } from "../shared/types";
import { getState } from "../shared/storage";
import { startDetector, type DetectedElement } from "./detector";
import {
  show,
  hide,
  isVisible,
  moveSelection,
  confirmSelection,
} from "./dropdown";
import {
  getCurrentText,
  getCaretIndex,
  getCaretRect,
  inject,
} from "./injector";

let state: StorageState | null = null;

const atTriggers = new WeakMap<Element, { atIndex: number }>();

async function init() {
  state = await getState();
  if (
    !state.allowedDomains.some(
      (d) => location.hostname === d || location.hostname.endsWith("." + d),
    )
  )
    return;

  // Updates the memory cache with the latest values for whenever the extension storage is updated
  chrome.storage.onChanged.addListener(() => {
    getState().then((s) => {
      state = s;
    });
  });

  // Start observing the page for input changes
  startDetector(
    (detected) => attachListener(detected),
    () => {
      hide();
    },
  );
}

function getActiveShortcuts() {
  if (!state) return [];
  const brand =
    state.brands.find((b) => b.id === state!.activeBrandId) ?? state.brands[0];
  return brand?.shortcuts ?? [];
}

function attachListener(detected: DetectedElement) {
  // 'input' fires on plain textareas/inputs; Slate (React-managed contenteditable)
  // often swallows the native input event, so keyup is the reliable fallback.
  // TODO understand - SLATE
  detected.el.addEventListener("input", () => handleInput(detected));
  detected.el.addEventListener("keyup", (e) => {
    const key = (e as KeyboardEvent).key;
    // Skip modifier-only keystrokes and navigation keys that can't change text
    if (
      [
        "Shift",
        "Control",
        "Alt",
        "Meta",
        "CapsLock",
        "Tab",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "PageUp",
        "PageDown",
        "F1",
        "F2",
        "F3",
        "F4",
        "F5",
        "F6",
        "F7",
        "F8",
        "F9",
        "F10",
        "F11",
        "F12",
      ].includes(key)
    )
      return;
    // Yield to the event loop so React (Slate) has flushed its pending state
    // update into the DOM before we read textContent / getSelection().
    setTimeout(() => handleInput(detected), 0);
  });

  // Custom handling of navigating / selecting keys
  detected.el.addEventListener("keydown", (e) =>
    handleKeydown(e as KeyboardEvent, detected),
  );

  // Hide
  detected.el.addEventListener("blur", () => {
    setTimeout(() => hide(), 150);
  });
}

function handleInput(detected: DetectedElement) {
  // Get the text after @
  const text = getCurrentText(detected);
  const caret = getCaretIndex(detected);

  const beforeCaret = text.slice(0, caret);
  const atMatch = beforeCaret.match(/@([^\s@]*)$/);

  if (!atMatch) {
    hide();
    atTriggers.delete(detected.el);
    return;
  }

  const partial = atMatch[1].toLowerCase();
  const atIndex = beforeCaret.lastIndexOf("@" + atMatch[1]);

  // Store the DOM element that is being typed into
  atTriggers.set(detected.el, { atIndex });

  // Find matches
  const shortcuts = getActiveShortcuts().filter((s) =>
    s.key.toLowerCase().startsWith(partial),
  );

  if (!shortcuts.length) {
    hide();
    return;
  }

  const anchorRect = getCaretRect(detected);
  show(shortcuts, anchorRect, (selected) => {
    const trigger = atTriggers.get(detected.el);
    if (!trigger) return;
    inject(detected, trigger.atIndex, caret, selected.value);
    atTriggers.delete(detected.el);
  });
}

/**
 * Handle Navigating and selecting Brand Context Keys
 */
function handleKeydown(e: KeyboardEvent, _detected: DetectedElement) {
  if (!isVisible()) return;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    moveSelection(1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    moveSelection(-1);
  } else if (e.key === "Enter") {
    e.preventDefault();
    e.stopPropagation();
    confirmSelection();
  } else if (e.key === "Escape") {
    e.preventDefault();
    hide();
  }
}

init();
