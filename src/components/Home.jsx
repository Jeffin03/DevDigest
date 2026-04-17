export default function Home({ terms, cases, loading, onGoTerm, setSection }) {
  if (loading) return (
    <div className="animate-pulse space-y-6">
      <div className="rounded-2xl border border-white/5 bg-white/5 h-56 w-full" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-xl" />)}
      </div>
    </div>
  )

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const daily = terms.length ? terms[parseInt(today, 10) % terms.length] : null
  const recent = terms.slice(0, 6)
  const categories = new Set(terms.map(t => t.category).filter(Boolean)).size

  // Format date from YYYY-MM-DD to "Apr 12, 2026"
  const formatDate = (d) => {
    if (!d) return '—'
    const date = new Date(d + 'T00:00:00')
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="animate-fade-in">
      {/* Hero daily term */}
      {daily && (
        <div className="relative rounded-3xl border border-accent-violet/30 bg-gradient-to-br from-accent-violet/10 via-bg-surface to-accent-green/5 p-8 sm:p-10 mb-10 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-mesh opacity-10 blur-3xl -z-10" />
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-accent-violet/20 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-accent-violet animate-ping opacity-20 rounded-full" />
                <span className="relative w-2.5 h-2.5 rounded-full bg-accent-violet-light inline-block shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-accent-violet-light font-bold">Featured Daily Insight</span>
            </div>
            <span className="inline-block text-[10px] uppercase tracking-widest text-accent-green bg-accent-green/10 border border-accent-green/20 px-3 py-1 rounded-full font-bold">
              {daily.category || 'General CS'}
            </span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
            {daily.topic}
          </h2>
          <p className="text-text-secondary leading-relaxed max-w-3xl mb-8 text-base sm:text-lg font-medium opacity-90">
            {daily.definition}
          </p>
          
          <div className="flex gap-4 flex-wrap">
            {daily.url && (
              <a href={daily.url} target="_blank" rel="noreferrer"
                className="group inline-flex items-center gap-2 bg-accent-violet hover:bg-accent-violet-light text-white text-sm font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-accent-violet/20 hover:shadow-accent-violet/40 hover:-translate-y-1">
                Deep Dive 
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            )}
            <button
              onClick={() => onGoTerm(daily.topic)}
              className="inline-flex items-center gap-2 text-text-primary border border-border hover:border-border-bright text-sm font-bold px-6 py-3 rounded-2xl transition-all bg-white/5 backdrop-blur-sm hover:bg-white/10">
              Glossary Details
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        {[
          { 
            label: 'Loaded Terms', 
            value: terms.length || '—', 
            color: 'text-accent-violet-light',
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" /></svg>
          },
          { 
            label: 'Knowledge Hubs', 
            value: categories || '—', 
            color: 'text-accent-cyan',
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          },
          { 
            label: 'Security Feed', 
            value: cases.length || '—', 
            color: 'text-accent-red',
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          },
          { 
            label: 'Fresh Intel', 
            value: formatDate(terms[0]?.date_added), 
            color: 'text-accent-green',
            icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          },
        ].map(s => (
          <div key={s.label} className="glass group rounded-2xl p-5 border border-border hover:border-border-bright transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl bg-white/5 transition-colors group-hover:bg-white/10 ${s.color}`}>
                {s.icon}
              </div>
            </div>
            <div className={`font-display text-2xl font-bold mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-text-muted text-[10px] font-bold uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent terms */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-1 bg-accent-violet rounded-full" />
          <h3 className="font-display text-xl font-bold text-text-primary tracking-tight">Recently Added</h3>
        </div>
        <button
          onClick={() => setSection('glossary')}
          className="text-text-secondary text-sm font-bold hover:text-accent-violet-light transition-colors flex items-center gap-1 group">
          Exploration Hub 
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recent.map((t, i) => (
          <button
            key={t.topic}
            onClick={() => onGoTerm(t.topic)}
            className="animate-slide-up glass glass-hover rounded-2xl p-5 text-left group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
          >
            <span className="text-[10px] uppercase tracking-widest text-accent-violet-light font-bold mb-3 block opacity-80 group-hover:opacity-100 transition-opacity">
              {t.category || 'General'}
            </span>
            <div className="text-text-primary font-bold text-base mb-2 group-hover:text-accent-violet-light transition-colors line-clamp-1">
              {t.topic}
            </div>
            <p className="text-text-secondary text-xs line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">{t.definition}</p>
          </button>
        ))}
      </div>
    </div>
  )
}