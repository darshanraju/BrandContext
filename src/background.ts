import { getState, setState } from "./shared/storage";

const BRAND_COLORS = ["#F97316", "#818cf8", "#34d399", "#fb7185", "#38bdf8"];

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== "install") return;

  const existing = await getState();
  if (existing.brands.length > 0) return; // already seeded

  const id = crypto.randomUUID();
  await setState({
    brands: [
      {
        id,
        name: "Superfluid Campaign",
        color: BRAND_COLORS[0],
        shortcuts: [
          { key: "primary", value: "#FAFDA0" },
          { key: "secondary", value: "#2B2D42" },
          { key: "tone", value: "cinematic, minimal, editorial" },
          {
            key: "style",
            value:
              "soft lighting, warm tones, 24mm lens, shallow depth of field",
          },
          { key: "motion", value: "slow drift, subtle parallax, no hard cuts" },
          {
            key: "mission",
            value:
              "We create immersive brand worlds for forward-thinking companies.",
          },
        ],
      },
    ],
    activeBrandId: id,
    allowedDomains: ["dream.ai", "lumalabs.ai", "localhost", "127.0.0.1"],
  });
});

export const BRAND_COLORS_EXPORTED = BRAND_COLORS;
