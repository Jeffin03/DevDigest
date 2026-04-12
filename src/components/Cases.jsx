import { useState, useMemo } from "react";

const SEV_COLORS = {
  critical: "text-red-400 bg-red-400/10 border-red-400/30",
  high: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  low: "text-green-400 bg-green-400/10 border-green-400/30",
};

const TYPE_COLORS = {
  cve: "text-violet-400 bg-violet-400/10 border-violet-400/30",
  research: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  malware: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  "supply-chain": "text-amber-400 bg-amber-400/10 border-amber-400/30",
  breach: "text-red-400 bg-red-400/10 border-red-400/30",
};

const TYPE_LABELS = {
  cve: "CVE",
  research: "Research",
  malware: "Malware",
  "supply-chain": "Supply Chain",
  breach: "Breach",
};

const SOURCE_LABELS = {
  nvd: "NVD",
  github_advisory: "GitHub Advisory",
};

function FeedCard({ c }) {
  const [open, setOpen] = useState(false);

  // Extract CVSS score from events if present
  const cvssEvent = c.events?.find((e) => e.desc?.startsWith("CVSS Score:"));
  const cvssScore = cvssEvent
    ? cvssEvent.desc.replace("CVSS Score: ", "")
    : null;

  // Patch events
  const patchEvents = c.events?.filter((e) =>
    e.title?.startsWith("Patch released"),
  );
  const isPatched = patchEvents?.length > 0;

  return (
    <div
      className={`glass rounded-xl border transition-all duration-200 overflow-hidden ${open ? "border-border-bright" : "border-border hover:border-border-bright"}`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left p-4 flex items-start gap-4"
      >
        {/* Severity indicator strip */}
        <div
          className={`w-1 self-stretch rounded-full flex-shrink-0 ${
            c.severity === "critical"
              ? "bg-red-400"
              : c.severity === "high"
                ? "bg-orange-400"
                : c.severity === "medium"
                  ? "bg-amber-400"
                  : "bg-green-400"
          }`}
        />

        <div className="flex-1 min-w-0">
          {/* Top row — badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${SEV_COLORS[c.severity] || "text-text-muted bg-white/5 border-border"}`}
            >
              {c.severity?.toUpperCase()}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TYPE_COLORS[c.type] || "text-text-muted bg-white/5 border-border"}`}
            >
              {TYPE_LABELS[c.type] || c.type}
            </span>
            {isPatched && (
              <span className="text-xs px-2 py-0.5 rounded-full border font-medium text-green-400 bg-green-400/10 border-green-400/30">
                ✓ Patched
              </span>
            )}
            {cvssScore && cvssScore !== "not yet available" && (
              <span className="text-xs font-mono text-text-muted">
                CVSS {cvssScore}
              </span>
            )}
          </div>

          {/* Title */}
          <p className="text-text-primary text-sm font-medium leading-snug mb-2 line-clamp-2">
            {c.title}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap gap-3 text-xs text-text-muted">
            {c.cve_id && (
              <span className="font-mono text-accent-violet-light">
                {c.cve_id}
              </span>
            )}
            {c.affected && (
              <span className="truncate max-w-xs">{c.affected}</span>
            )}
            {c.year && <span>{c.year}</span>}
          </div>
        </div>

        {/* Expand chevron */}
        <span
          className={`text-text-muted flex-shrink-0 mt-1 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          ⌄
        </span>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="px-4 pb-4 border-t border-border-subtle animate-fade-in">
          {/* Summary */}
          <p className="text-text-secondary text-sm leading-relaxed mt-4 mb-4">
            {c.summary}
          </p>

          {/* Patch info */}
          {patchEvents?.length > 0 && (
            <div className="mb-4 space-y-1.5">
              {patchEvents.map((e, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                  <div>
                    <span className="text-text-primary font-medium">
                      {e.title}
                    </span>
                    {e.desc && (
                      <span className="text-text-muted ml-2">{e.desc}</span>
                    )}
                    {e.date && (
                      <span className="text-text-muted ml-2 font-mono">
                        {e.date}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
            {c.source_url ? (
              <a
                href={c.source_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-accent-blue hover:underline"
              >
                View advisory ↗
              </a>
            ) : (
              <span />
            )}
            <span className="text-xs text-text-muted">
              {SOURCE_LABELS[c.source] || c.source}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Cases({ cases, loading }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sevFilter, setSevFilter] = useState("");

  const filtered = useMemo(
    () =>
      cases.filter(
        (c) =>
          (!search ||
            c.title?.toLowerCase().includes(search.toLowerCase()) ||
            c.summary?.toLowerCase().includes(search.toLowerCase()) ||
            c.cve_id?.toLowerCase().includes(search.toLowerCase())) &&
          (!typeFilter || c.type === typeFilter) &&
          (!sevFilter || c.severity === sevFilter),
      ),
    [cases, search, typeFilter, sevFilter],
  );

  // Stats
  const stats = useMemo(
    () => ({
      total: cases.length,
      critical: cases.filter((c) => c.severity === "critical").length,
      patched: cases.filter((c) =>
        c.events?.some((e) => e.title?.startsWith("Patch released")),
      ).length,
    }),
    [cases],
  );

  if (loading)
    return (
      <div className="animate-pulse space-y-3 pt-4">
        <div className="h-8 w-48 bg-white/5 rounded-xl mx-auto mb-6" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 bg-white/5 rounded-xl" />
        ))}
      </div>
    );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-gradient mb-2">
          Security Feed
        </h1>
        <p className="text-text-secondary text-sm">
          Live CVEs and advisories from NVD & GitHub Advisory Database
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total },
          { label: "Critical", value: stats.critical, color: "text-red-400" },
          { label: "Patched", value: stats.patched, color: "text-green-400" },
        ].map((s) => (
          <div
            key={s.label}
            className="glass rounded-xl p-3 text-center border border-border"
          >
            <div
              className={`font-display text-xl font-bold ${s.color || "text-text-primary"}`}
            >
              {s.value}
            </div>
            <div className="text-xs text-text-muted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by title, CVE ID, or keyword…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 glass rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none border border-border focus:border-accent-violet/50 transition-colors"
        />
        <select
          value={sevFilter}
          onChange={(e) => setSevFilter(e.target.value)}
          className="glass rounded-xl px-4 py-2.5 text-sm text-text-secondary border border-border outline-none bg-bg-surface focus:border-accent-violet/50"
        >
          <option value="">All Severities</option>
          {["critical", "high", "medium", "low"].map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="glass rounded-xl px-4 py-2.5 text-sm text-text-secondary border border-border outline-none bg-bg-surface focus:border-accent-violet/50"
        >
          <option value="">All Types</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="text-xs text-text-muted mb-4">
        Showing {filtered.length} of {cases.length} entries
      </p>

      {/* Feed */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <div className="text-4xl mb-3">
            {cases.length === 0 ? "📭" : "🔍"}
          </div>
          <p>
            {cases.length === 0
              ? "No data yet — run the GitHub Action to populate the feed."
              : "No entries match your filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <FeedCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </div>
  );
}
