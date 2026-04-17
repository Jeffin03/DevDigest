import { useState, useMemo } from 'react'

export default function Glossary({ terms, initialSearch = '', onGoTerm }) {
  const [search, setSearch] = useState(initialSearch)
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('date-desc')
  const [selected, setSelected] = useState(null)

  const categories = useMemo(() =>
    [...new Set(terms.map(t => t.category).filter(Boolean))].sort(), [terms])

  const filtered = useMemo(() => {
    let f = terms.filter(t =>
      (!search || t.topic?.toLowerCase().includes(search.toLowerCase()) ||
        t.definition?.toLowerCase().includes(search.toLowerCase())) &&
      (!category || t.category === category)
    )
    f.sort((a, b) => {
      if (sort === 'alpha-asc') return (a.topic || '').localeCompare(b.topic || '')
      if (sort === 'alpha-desc') return (b.topic || '').localeCompare(a.topic || '')
      if (sort === 'date-asc') return new Date(a.date_added) - new Date(b.date_added)
      return new Date(b.date_added) - new Date(a.date_added)
    })
    return f
  }, [terms, search, category, sort])

  const related = useMemo(() =>
    selected
      ? terms.filter(r => r.category === selected.category && r.topic !== selected.topic).slice(0, 4)
      : [], [selected, terms])

  return (
    <div className="animate-fade-in">
      <div className="relative text-center mb-12 py-4">
        <div className="absolute inset-0 -z-10 bg-mesh opacity-20 blur-3xl transform -translate-y-1/2 scale-150" />
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-gradient mb-4">CS Glossary</h1>
        <p className="text-text-secondary text-base max-w-2xl mx-auto leading-relaxed">
          Browsing {filtered.length} terms across {categories.length} specialized categories
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-10">
        <div className="flex-1 min-w-[280px] relative group">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent-violet-light transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search terms or definitions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full glass rounded-2xl pl-11 pr-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none border border-border focus:border-accent-violet-light/50 focus:ring-4 focus:ring-accent-violet-light/5 transition-all shadow-inner"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="glass rounded-2xl px-4 py-3 text-sm text-text-secondary border border-border outline-none focus:border-accent-violet-light/50 transition-all cursor-pointer hover:border-border-bright bg-bg-surface"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="glass rounded-2xl px-4 py-3 text-sm text-text-secondary border border-border outline-none focus:border-accent-violet-light/50 transition-all cursor-pointer hover:border-border-bright bg-bg-surface"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="alpha-asc">A → Z</option>
            <option value="alpha-desc">Z → A</option>
          </select>
        </div>
      </div>

      {/* Compact Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-text-muted animate-fade-in">
          <div className="text-5xl mb-4 opacity-50">🔍</div>
          <p className="text-lg font-medium tracking-tight">No terms match your search protocol.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((t, i) => (
            <button
              key={t.topic}
              onClick={() => setSelected(t)}
              className="animate-slide-up glass rounded-2xl p-5 flex flex-col gap-2 text-left transition-all duration-300 hover:border-accent-violet-light/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 group"
              style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}
            >
              <span className="text-[10px] uppercase tracking-widest text-accent-violet-light font-bold truncate w-full opacity-70 group-hover:opacity-100 transition-opacity">
                {t.category || 'General'}
              </span>
              <span className="font-display text-base font-bold text-text-primary leading-tight line-clamp-2 group-hover:text-white transition-colors">
                {t.topic}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Overlay */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="glass rounded-3xl p-8 max-w-xl w-full shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] border-accent-violet-light/20 flex flex-col gap-6 relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-violet/10 blur-3xl -z-10" />
            
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-accent-violet-light font-bold bg-accent-violet/10 border border-accent-violet/20 px-3 py-1 rounded-full mb-4 inline-block">
                  {selected.category || 'General'}
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{selected.topic}</h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-10 h-10 rounded-full bg-white/5 border border-border flex items-center justify-center text-text-muted hover:text-white hover:border-white/20 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Definition */}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 shadow-inner">
              <p className="text-text-secondary text-base leading-relaxed opacity-90">{selected.definition}</p>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-accent-violet" />
                  Contextually Linked
                </p>
                <div className="flex flex-wrap gap-2">
                  {related.map(r => (
                    <button
                      key={r.topic}
                      onClick={() => { onGoTerm?.(r.topic); setSelected(r) }}
                      className="text-xs px-3 py-1.5 rounded-xl border border-border text-text-muted hover:text-accent-violet-light hover:border-accent-violet-light/30 bg-white/5 transition-all"
                    >
                      {r.topic}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-border-subtle">
              <a href={selected.url || '#'} target="_blank" rel="noreferrer"
                className="group inline-flex items-center gap-2 text-xs font-bold text-accent-blue hover:text-accent-blue/80 transition-all">
                Wikipedia Protocol 
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <div className="text-[10px] text-text-muted font-mono flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {selected.date_added}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}