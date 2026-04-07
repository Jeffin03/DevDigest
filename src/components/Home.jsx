export default function Home({ terms, cases, onGoTerm }) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const daily = terms.length ? terms[parseInt(today, 10) % terms.length] : null
  const recent = terms.slice(0, 6)
  const categories = new Set(terms.map(t => t.category).filter(Boolean)).size

  return (
    <div className="animate-fade-in">
      {/* Hero daily term */}
      {daily && (
        <div className="relative rounded-2xl border border-accent-violet/30 bg-gradient-to-br from-accent-violet/10 to-accent-green/5 p-8 mb-8 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-accent-violet/15 blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <span className="pulse-dot w-2 h-2 rounded-full bg-accent-violet-light inline-block" />
            <span className="text-xs uppercase tracking-widest text-accent-violet-light font-semibold">Daily Term</span>
          </div>
          <span className="inline-block text-xs uppercase tracking-wider text-accent-green bg-accent-green/10 px-3 py-0.5 rounded-full font-semibold mb-3">
            {daily.category || 'General'}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-text-primary mb-3">{daily.topic}</h2>
          <p className="text-text-secondary leading-relaxed max-w-2xl mb-5 text-base">{daily.definition}</p>
          <div className="flex gap-3 flex-wrap">
            {daily.url && (
              <a href={daily.url} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 bg-accent-violet hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all hover:-translate-y-0.5">
                Read More ↗
              </a>
            )}
            <button
              onClick={() => onGoTerm(daily.topic)}
              className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary border border-border hover:border-border-bright text-sm font-medium px-4 py-2 rounded-lg transition-all bg-white/5">
              View in Glossary
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Terms', value: terms.length || '—', color: 'text-accent-violet-light' },
          { label: 'Categories', value: categories || '—', color: 'text-accent-cyan' },
          { label: 'Case Studies', value: cases.length || '—', color: 'text-accent-red' },
          { label: 'Last Updated', value: terms[0]?.date_added || '—', color: 'text-accent-green' },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl p-4">
            <div className={`font-display text-2xl font-bold mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-text-muted text-xs uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent terms */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-text-primary">Recently Added</h3>
        <span className="text-text-secondary text-sm cursor-pointer hover:text-accent-green transition-colors">
          View all →
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {recent.map(t => (
          <button
            key={t.topic}
            onClick={() => onGoTerm(t.topic)}
            className="glass glass-hover rounded-xl p-4 text-left group"
          >
            <span className="text-xs uppercase tracking-wider text-accent-violet-light font-semibold mb-2 block">
              {t.category || 'General'}
            </span>
            <div className="text-text-primary font-medium mb-1 group-hover:text-accent-violet-light transition-colors">
              {t.topic}
            </div>
            <p className="text-text-secondary text-sm line-clamp-2 leading-relaxed">{t.definition}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
