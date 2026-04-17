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
      className={`group glass rounded-2xl border transition-all duration-500 overflow-hidden ${
        open 
          ? "border-accent-violet-light/30 bg-bg-elevated/80 shadow-2xl shadow-accent-violet-light/5" 
          : "border-border hover:border-border-bright hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
      }`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left p-5 flex items-start gap-5 relative"
      >
        {/* Severity indicator glow */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
            c.severity === "critical"
              ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              : c.severity === "high"
                ? "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                : c.severity === "medium"
                  ? "bg-amber-500"
                  : "bg-green-500"
          } ${open ? "w-1.5" : "w-1"}`}
        />

        <div className="flex-1 min-w-0">
          {/* Top row — badges */}
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span
              className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold uppercase tracking-wider transition-all ${
                SEV_COLORS[c.severity] || "text-text-muted bg-white/5 border-border"
              } ${c.severity === 'critical' ? 'animate-pulse2 shadow-[0_0_8px_rgba(248,113,113,0.2)]' : ''}`}
            >
              {c.severity?.toUpperCase()}
            </span>
            <span
              className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold uppercase tracking-wider ${TYPE_COLORS[c.type] || "text-text-muted bg-white/5 border-border"}`}
            >
              {TYPE_LABELS[c.type] || c.type}
            </span>
            {isPatched && (
              <span className="text-[10px] px-2.5 py-1 rounded-lg border border-green-500/30 font-bold uppercase tracking-wider text-green-400 bg-green-500/10 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Patched
              </span>
            )}
            {cvssScore && cvssScore !== "not yet available" && (
              <span className="text-[10px] font-mono font-bold text-text-muted bg-white/5 px-2 py-1 rounded-md border border-border">
                CVSS {cvssScore}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className={`text-text-primary text-base font-semibold leading-tight mb-3 transition-colors ${open ? 'text-white' : 'group-hover:text-white'}`}>
            {c.title}
          </h3>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
            {c.cve_id && (
              <span className="font-mono text-accent-violet-light font-semibold bg-accent-violet/10 px-2 py-0.5 rounded border border-accent-violet/20">
                {c.cve_id}
              </span>
            )}
            {c.affected && (
              <span className="truncate max-w-xs flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {c.affected}
              </span>
            )}
            {c.year && (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {c.year}
              </span>
            )}
          </div>
        </div>

        {/* Expand chevron */}
        <div
          className={`p-2 rounded-full bg-white/5 text-text-muted flex-shrink-0 mt-1 transition-all duration-300 ${open ? "rotate-180 bg-accent-violet/20 text-accent-violet-light" : "group-hover:bg-white/10"}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="px-5 pb-6 border-t border-border-subtle animate-fade-in">
          {/* Summary */}
          <div className="mt-5 mb-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2.5">Detailed Summary</h4>
            <p className="text-text-secondary text-sm leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
              {c.summary}
            </p>
          </div>

          {/* Patch info */}
          {patchEvents?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">Resolution Updates</h4>
              <div className="space-y-3">
                {patchEvents.map((e, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-text-primary font-semibold">
                        {e.title}
                      </div>
                      {e.desc && (
                        <p className="text-text-secondary text-xs mt-1">{e.desc}</p>
                      )}
                      {e.date && (
                        <div className="text-[10px] text-text-muted mt-2 font-mono flex items-center gap-1">
                           <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {e.date}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-5 border-t border-border-subtle">
            {c.source_url ? (
              <a
                href={c.source_url}
                target="_blank"
                rel="noreferrer"
                className="group/link flex items-center gap-2 text-xs font-semibold text-accent-blue hover:text-accent-blue/80 transition-colors"
              >
                View Full Advisory 
                <svg className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-border text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Source: {SOURCE_LABELS[c.source] || c.source}
            </div>
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
      <div className="relative text-center mb-12 py-4">
        <div className="absolute inset-0 -z-10 bg-mesh opacity-20 blur-3xl transform -translate-y-1/2 scale-150" />
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-gradient mb-4">
          Security Feed
        </h1>
        <p className="text-text-secondary text-base max-w-2xl mx-auto leading-relaxed">
          Real-time monitoring of CVEs and security advisories from NVD and GitHub Advisory Database.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { 
            label: "Total Incidents", 
            value: stats.total, 
            icon: (
              <svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            ),
            bg: "hover:bg-accent-blue/5",
            border: "hover:border-accent-blue/30"
          },
          { 
            label: "Critical Priority", 
            value: stats.critical, 
            color: "text-red-400", 
            icon: (
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ),
            bg: "hover:bg-red-400/5",
            border: "hover:border-red-400/30"
          },
          { 
            label: "Patched", 
            value: stats.patched, 
            color: "text-green-400", 
            icon: (
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            bg: "hover:bg-green-400/5",
            border: "hover:border-green-400/30"
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`glass group rounded-2xl p-5 border border-border transition-all duration-300 ${s.bg} ${s.border} hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-muted text-[10px] font-bold uppercase tracking-widest">{s.label}</span>
              <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors shadow-inner">
                {s.icon}
              </div>
            </div>
            <div className={`font-display text-3xl font-bold ${s.color || "text-text-primary"}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex-1 min-w-[280px] relative group">
          <svg 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent-violet-light transition-colors"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by title, CVE ID, or keyword…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass rounded-2xl pl-11 pr-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none border border-border focus:border-accent-violet-light/50 focus:ring-4 focus:ring-accent-violet-light/5 transition-all shadow-inner"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={sevFilter}
            onChange={(e) => setSevFilter(e.target.value)}
            className="glass rounded-2xl px-4 py-3 text-sm text-text-secondary border border-border outline-none bg-bg-surface focus:border-accent-violet-light/50 transition-all cursor-pointer hover:border-border-bright"
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
            className="glass rounded-2xl px-4 py-3 text-sm text-text-secondary border border-border outline-none bg-bg-surface focus:border-accent-violet-light/50 transition-all cursor-pointer hover:border-border-bright"
          >
            <option value="">All Types</option>
            {Object.entries(TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
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
        <div className="space-y-4">
          {filtered.map((c, i) => (
            <div 
              key={c.id} 
              className="animate-slide-up" 
              style={{ animationDelay: `${i * 70}ms`, animationFillMode: 'both' }}
            >
              <FeedCard c={c} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
