import { useState } from "react";
import { useStorage } from "../popup/hooks/useStorage";
import { BrandSidebar } from "./components/BrandSidebar";
import { ShortcutTable } from "./components/ShortcutTable";
import { AllowedSites } from "./components/AllowedSites";

type View = "shortcuts" | "sites";

export function Options() {
  const state = useStorage();
  const [view, setView] = useState<View>("shortcuts");

  if (!state)
    return <div style={{ padding: 32, color: "var(--subtle)" }}>Loading…</div>;

  const activeBrand =
    state.brands.find((b) => b.id === state.activeBrandId) ??
    state.brands[0] ??
    null;

  return (
    <div className="options-layout">
      <BrandSidebar
        brands={state.brands}
        activeBrandId={state.activeBrandId}
        onSelectSites={() => setView("sites")}
        onSelectBrand={() => setView("shortcuts")}
      />
      <div className="options-main">
        {view === "sites" ? (
          <AllowedSites domains={state.allowedDomains} />
        ) : (
          <ShortcutTable brand={activeBrand} allBrands={state.brands} />
        )}
      </div>
    </div>
  );
}
