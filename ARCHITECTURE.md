# BrandKey Architecture

## 1. Component Map

```mermaid
graph TD
    BG["background.ts\nSeeds default brands +\nallowedDomains on install"]
    STORAGE["shared/storage.ts\nchrome.storage.sync\nread/write wrapper"]
    TYPES["shared/types.ts\nStorageState, Brand,\nShortcut interfaces"]

    CONTENT["content/content.ts\nOrchestrator — runs on\nevery page load"]
    DETECTOR["content/detector.ts\nWatches DOM via\nMutationObserver,\nclassifies input elements"]
    DROPDOWN["content/dropdown.ts\nFloating autocomplete\nUI anchored to caret"]
    INJECTOR["content/injector.ts\nWrites text into the\nright element type"]

    BG --> STORAGE
    CONTENT --> STORAGE
    CONTENT --> DETECTOR
    CONTENT --> DROPDOWN
    CONTENT --> INJECTOR
    STORAGE --> TYPES
```

## 2. User Interaction Flow

What happens when you type `@tone` in a prompt field.

```mermaid
sequenceDiagram
    actor User
    participant DOM as Browser DOM
    participant Detector as detector.ts
    participant Content as content.ts
    participant Dropdown as dropdown.ts
    participant Injector as injector.ts

    Note over Detector: MutationObserver watches for new input elements
    DOM-->>Detector: textarea added to page
    Detector-->>Content: onFound({ el, type: 'midjourney' })
    Content->>DOM: attach input/keyup/keydown/blur listeners

    User->>DOM: types "@tone"
    DOM->>Content: input event fires
    Content->>Content: getText() → find @tone pattern
    Content->>Content: filter shortcuts matching "tone"
    Content->>Dropdown: show(matches, caretRect, onSelect)
    Dropdown-->>User: floating list appears at cursor

    User->>DOM: presses Enter
    DOM->>Content: keydown → confirmSelection()
    Content->>Injector: inject(detected, atIndex, caretIndex, value)
    Injector->>DOM: replace "@tone" with shortcut value
    DOM-->>User: text updated in prompt field
```

## 3. Injection Strategies

Different AI tools use different editor implementations — each needs a different injection approach.

```mermaid
flowchart TD
    START["inject() called\nwith DetectedElement"]

    CHECK_SLATE{type === 'slate'?}
    CHECK_CE{type === 'contenteditable'?}
    CHECK_REACT{type === 'react-textarea'\nor 'comfyui'\nor 'midjourney'?}

    SLATE["injectSlate()\nSet DOM selection range →\ndispatch beforeinput event\nso Slate's React state updates"]
    CE["injectContentEditable()\nSet DOM selection range →\nexecCommand('insertText')\nworks on plain CE elements"]
    REACT["injectReactTextarea()\nUse native prototype setter\n(bypasses React's value trap) →\ndispatch input event"]
    GENERIC["injectGeneric()\nDirect el.value assignment →\ndispatch input event\nworks for non-React textareas"]

    START --> CHECK_SLATE
    CHECK_SLATE -- yes --> SLATE
    CHECK_SLATE -- no --> CHECK_CE
    CHECK_CE -- yes --> CE
    CHECK_CE -- no --> CHECK_REACT
    CHECK_REACT -- yes --> REACT
    CHECK_REACT -- no --> GENERIC
```

> **Why the native setter trick?** React intercepts the `value` property on textarea elements, so direct `el.value = x` doesn't trigger a re-render. `Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set` bypasses React's override and forces it to recognise the change.
