import { useState } from "react";
import { setState } from "../../shared/storage";
import { TrashIcon } from "../../shared/icons";

interface Props {
  domains: string[];
}

export function AllowedSites({ domains }: Props) {
  const [input, setInput] = useState("");

  function sanitize(raw: string): string {
    return raw
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .toLowerCase();
  }

  async function addDomain() {
    const d = sanitize(input);
    if (!d || domains.includes(d)) {
      setInput("");
      return;
    }
    await setState({ allowedDomains: [...domains, d] });
    setInput("");
  }

  async function removeDomain(d: string) {
    await setState({ allowedDomains: domains.filter((x) => x !== d) });
  }

  return (
    <div className="allowed-sites">
      <h2 className="allowed-sites-title">Allowed Sites</h2>
      <p className="allowed-sites-desc">
        The @ autocomplete activates only on these domains. Add a hostname like{" "}
        <code>dream.ai</code> — no protocol needed.
      </p>
      {domains.map((d) => (
        <div key={d} className="domain-row">
          <span className="domain-text">{d}</span>
          <button className="btn-icon" onClick={() => removeDomain(d)}>
            <TrashIcon size={14} />
          </button>
        </div>
      ))}
      <div className="add-domain-row">
        <input
          className="domain-input"
          value={input}
          placeholder="e.g. chatgpt.com"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addDomain();
          }}
        />
        <button className="btn-add-domain" onClick={addDomain}>
          Add
        </button>
      </div>
    </div>
  );
}
