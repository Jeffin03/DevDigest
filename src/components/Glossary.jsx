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
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-gradient mb-2">CS Glossary</h1>
        <p className="text-text-secondary text-sm">Browsing {filtered.length} terms across {categories.length} categories</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search terms or definitions…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 glass rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none border border-border focus:border-accent-violet/50 transition-colors"
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="glass rounded-xl px-4 py-2.5 text-sm text-text-secondary border border-border outline-none focus:border-accent-violet/50 transition-colors bg-bg-surface"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="glass rounded-xl px-4 py-2.5 text-sm text-text-secondary border border-border outline-none focus:border-accent-violet/50 transition-colors bg-bg-surface"
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="alpha-asc">A → Z</option>
          <option value="alpha-desc">Z → A</option>
        </select>
      </div>

      {/* Compact Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <div className="text-4xl mb-3">🔍</div>
          <p>No terms found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map(t => (
            <button
              key={t.topic}
              onClick={() => setSelected(t)}
              className="glass glass-hover rounded-xl p-4 flex flex-col gap-1.5 text-left transition-all"
            >
              <span className="text-xs uppercase tracking-wider text-accent-violet-light font-semibold truncate w-full">
                {t.category || 'General'}
              </span>
              <span className="font-display text-sm font-bold text-text-primary leading-snug line-clamp-2">
                {t.topic}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Overlay */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="glass rounded-2xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-text-primary mb-2">{selected.topic}</h2>
                <span className="text-xs uppercase tracking-wider text-accent-violet-light font-semibold bg-accent-violet/10 px-2.5 py-1 rounded-full">
                  {selected.category || 'General'}
                </span>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-text-muted hover:text-text-primary transition-colors text-xl leading-none mt-1"
              >
                ✕
              </button>
            </div>

            {/* Definition */}
            <p className="text-text-secondary text-sm leading-relaxed">{selected.definition}</p>

            {/* Related */}
            {related.length > 0 && (
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Related</p>
                <div className="flex flex-wrap gap-1.5">
                  {related.map(r => (
                    <button
                      key={r.topic}
                      onClick={() => { onGoTerm?.(r.topic); setSelected(r) }}
                      className="text-xs px-2 py-0.5 rounded-full border border-border text-text-muted hover:text-text-secondary hover:border-border-bright transition-all"
                    >
                      {r.topic}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
              <a href={selected.url || '#'} target="_blank" rel="noreferrer"
                className="text-xs text-accent-blue hover:underline">
                Wikipedia ↗
              </a>
              <span className="text-xs text-text-muted font-mono">{selected.date_added}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}