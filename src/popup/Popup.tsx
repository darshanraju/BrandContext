import { useStorage } from "./hooks/useStorage";
import { Header } from "./components/Header";
import { BrandSwitcher } from "./components/BrandSwitcher";
import { ShortcutList } from "./components/ShortcutList";
import { Footer } from "./components/Footer";

export function Popup() {
  const state = useStorage();
  if (!state)
    return (
      <div className="popup">
        <div style={{ padding: 16, color: "var(--subtle)" }}>Loading…</div>
      </div>
    );

  const activeBrand =
    state.brands.find((b) => b.id === state.activeBrandId) ??
    state.brands[0] ??
    null;

  return (
    <div className="popup">
      <Header allowedDomains={state.allowedDomains} />
      <BrandSwitcher
        brands={state.brands}
        activeBrandId={state.activeBrandId}
      />
      <ShortcutList brand={activeBrand} />
      <Footer allowedDomains={state.allowedDomains} />
    </div>
  );
}
