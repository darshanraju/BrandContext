# BrandKey

A Chrome extension that injects brand context into AI prompt fields via `@key` shortcuts.

## Setup

**Requirements:** Node.js 18+, npm, Google Chrome (or Chromium).

```bash
cd brandkey
npm install
npm run build
```

The built extension lands in `brandkey/dist/`.

## Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `brandkey/dist/` folder

The BrandKey icon will appear in your toolbar.

## Usage

1. Click the extension icon → open the editor via **Open editor**
2. Create a brand and add `@key` → `value` shortcuts (e.g. `tone` → `cinematic, minimal, editorial`)
3. Go to **Sites** and add the domains where you want the extension active (e.g. `lumalabs.ai`)
4. Navigate to an allowed site, click into any AI prompt field, and type `@` — a dropdown will autocomplete your shortcuts

## Development

```bash
npm run dev      # watch mode — rebuilds on save
npm run test     # unit tests
npm run typecheck
```

## Notes

- This is a Chrome MV3 extension — there is no server or live URL to deploy to
- The built `dist/` folder is gitignored; run `npm run build` to produce it
- All data is stored locally in `chrome.storage.sync` (no backend required)
