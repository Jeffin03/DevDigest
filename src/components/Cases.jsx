import { useState, useMemo } from 'react'

const TYPE_LABELS = {
  breach: 'Major Breach',
  cve: 'CVE',
  research: 'Research',
  malware: 'Malware',
  'supply-chain': 'Supply Chain',
}

const SEV_COLORS = {
  critical: 'text-red-400 bg-red-400/10 border-red-400/30',
  high:     'text-orange-400 bg-orange-400/10 border-orange-400/30',
  medium:   'text-amber-400 bg-amber-400/10 border-amber-400/30',
  low:      'text-green-400 bg-green-400/10 border-green-400/30',
}

const TYPE_COLORS = {
  breach:         'text-red-400 bg-red-400/10 border-red-400/30',
  cve:            'text-violet-400 bg-violet-400/10 border-violet-400/30',
  research:       'text-blue-400 bg-blue-400/10 border-blue-400/30',
  malware:        'text-orange-400 bg-orange-400/10 border-orange-400/30',
  'supply-chain': 'text-amber-400 bg-amber-400/10 border-amber-400/30',
}

function IncidentCard({ c }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`glass rounded-xl border border-border overflow-hidden transition-all ${open ? 'border-border-bright' : ''}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left p-5 flex items-start justify-between gap-4"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TYPE_COLORS[c.type] || 'text-text-muted bg-white/5 border-border'}`}>
              {TYPE_LABELS[c.type] || c.type}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${SEV_COLORS[c.severity] || 'text-text-muted bg-white/5 border-border'}`}>
              {c.severity}
            </span>
          </div>
          <div className="font-display font-bold text-text-primary mb-1">{c.title}</div>
          <div className="flex flex-wrap gap-3 text-xs text-text-muted">
            {c.year && <span>📅 {c.year}</span>}
            {c.affected && <span>🏢 {c.affected}</span>}
            {c.cve_id && <span className="font-mono">🔖 {c.cve_id}</span>}
          </div>
        </div>
        <span className={`incident-toggle text-text-muted text-lg flex-shrink-0 mt-1 ${open ? 'rotate-180' : ''} transition-transform duration-300`}>⌄</span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-border-subtle animate-fade-in">
          <p className="text-text-secondary text-sm leading-relaxed mb-4 mt-4">{c.summary}</p>

          {c.events?.length > 0 && (
            <div className="space-y-3 mb-4">
              {c.events.map((e, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-accent-violet mt-1 flex-shrink-0" />
                    {i < c.events.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pb-3 min-w-0">
                    <span className="font-mono text-xs text-text-muted block mb-0.5">{e.date}</span>
                    <div className="text-text-primary text-sm font-medium">{e.title}</div>
                    {e.desc && <p className="text-text-secondary text-xs mt-0.5 leading-relaxed">{e.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {c.source_url && (
            <a href={c.source_url} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-accent-blue hover:underline">
              Source ↗
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default function Cases({ cases }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sevFilter, setSevFilter] = useState('')

  const filtered = useMemo(() => cases.filter(c =>
    (!search || c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.summary?.toLowerCase().includes(search.toLowerCase())) &&
    (!typeFilter || c.type === typeFilter) &&
    (!sevFilter  || c.severity === sevFilter)
  ), [cases, search, typeFilter, sevFilter])

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-gradient mb-2">Security Cases</h1>
        <p className="text-text-secondary text-sm">Real-world breaches, CVEs, and security research — with full incident timelines</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search incidents or keywords…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 glass rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none border border-border focus:border-accent-violet/50 transition-colors"
        />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="glass rounded-xl px-4 py-2.5 text-sm text-text-secondary border border-border outline-none bg-bg-surface focus:border-accent-violet/50">
          <option value="">All Types</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={sevFilter} onChange={e => setSevFilter(e.target.value)}
          className="glass rounded-xl px-4 py-2.5 text-sm text-text-secondary border border-border outline-none bg-bg-surface focus:border-accent-violet/50">
          <option value="">All Severities</option>
          {['critical', 'high', 'medium', 'low'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <div className="text-4xl mb-3">{cases.length === 0 ? '📭' : '🔍'}</div>
          <p>{cases.length === 0
            ? 'CaseStudies.json not found — run the GitHub Action to populate it.'
            : 'No incidents match your filters.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => <IncidentCard key={c.id} c={c} />)}
        </div>
      )}
    </div>
  )
}
