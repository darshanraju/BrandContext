type TargetElement = HTMLInputElement | HTMLTextAreaElement | HTMLElement;

const SELECTORS = [
  '[data-slate-editor="true"]',
  ".bg-panel textarea",
  '[contenteditable="true"]',
  'input[type="text"]',
  "textarea",
];

export interface DetectedElement {
  el: TargetElement;
  type:
    | "slate"
    | "react-textarea"
    | "comfyui"
    | "midjourney"
    | "contenteditable"
    | "generic";
}

function classify(el: Element): DetectedElement["type"] {
  if ((el as HTMLElement).dataset["slateEditor"] === "true") return "slate";
  if (el.tagName === "TEXTAREA" && el.closest(".bg-panel"))
    return "react-textarea";
  if (
    el.tagName === "TEXTAREA" &&
    (el as HTMLElement).hasAttribute("data-capture-wheel")
  )
    return "comfyui";
  if (
    el.tagName === "TEXTAREA" &&
    (el as HTMLElement).id === "desktop_input_bar"
  )
    return "midjourney";
  if ((el as HTMLElement).contentEditable === "true") return "contenteditable";
  return "generic";
}

export function startDetector(
  onFound: (detected: DetectedElement) => void,
  onLost: (el: TargetElement) => void,
): () => void {
  const attached = new WeakSet<Element>();

  function check(root: Element | Document) {
    const candidates =
      root instanceof Document
        ? document.querySelectorAll<Element>(SELECTORS.join(","))
        : root.matches?.(SELECTORS.join(","))
          ? [root]
          : root.querySelectorAll<Element>(SELECTORS.join(","));

    candidates.forEach((el) => {
      if (attached.has(el)) return;
      attached.add(el);
      onFound({ el: el as TargetElement, type: classify(el) });
    });
  }

  check(document);

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node instanceof Element) check(node);
      }
      for (const node of m.removedNodes) {
        if (node instanceof Element && attached.has(node)) {
          onLost(node as TargetElement);
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}
