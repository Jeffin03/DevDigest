import { useState } from 'react'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

export default function Quiz({ terms }) {
  const [deck, setDeck] = useState(() => shuffle(terms))
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [dir, setDir] = useState('term-def')

  const card = deck[idx] || null

  const next = () => { setFlipped(false); setTimeout(() => setIdx(i => (i + 1) % deck.length), 150) }
  const prev = () => { setFlipped(false); setTimeout(() => setIdx(i => (i - 1 + deck.length) % deck.length), 150) }
  const reshuffle = () => { setDeck(shuffle(terms)); setIdx(0); setFlipped(false) }

  if (terms.length === 0) return (
    <div className="text-center py-20 text-text-muted">
      <div className="text-4xl mb-3">📭</div>
      <p>No terms loaded yet. Run the Glossary collector first.</p>
    </div>
  )

  if (!card) return null

  const front = dir === 'term-def' ? card.topic : card.definition
  const back = dir === 'term-def' ? card.definition : card.topic

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-gradient mb-2">Flashcards</h1>
        <p className="text-text-secondary text-sm">Test your knowledge of CS terms</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-2">
          {[['term-def', 'Term → Definition'], ['def-term', 'Definition → Term']].map(([d, label]) => (
            <button key={d} onClick={() => { setDir(d); setFlipped(false) }}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${dir === d ? 'border-accent-violet bg-accent-violet/10 text-accent-violet-light' : 'border-border text-text-muted hover:border-border-bright'}`}>
              {label}
            </button>
          ))}
        </div>
        <span className="text-text-muted text-sm font-mono">Card {idx + 1} / {deck.length}</span>
      </div>

      {/* Card */}
      <div className="relative cursor-pointer mb-6 perspective-[1200px]" style={{ height: '280px' }} onClick={() => setFlipped(f => !f)}>
        <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`}>
          <div className="flashcard-face glass border border-border">
            <p className="text-xs uppercase tracking-widest text-text-muted mb-4">{dir === 'term-def' ? 'Term' : 'Definition'}</p>
            <div className="overflow-y-auto max-h-44 w-full text-center scrollbar-thin">
              <p className="font-display text-2xl font-bold text-text-primary">{front}</p>
            </div>
            <p className="text-text-muted text-xs mt-6">Click to reveal</p>
          </div>
          <div className="flashcard-face flashcard-back border border-accent-violet/30" style={{ background: '#0d1424' }}>
            <p className="text-xs uppercase tracking-widest text-accent-violet-light mb-4">{dir === 'term-def' ? 'Definition' : 'Term'}</p>
            <div className="overflow-y-auto max-h-44 w-full text-center scrollbar-thin">
              <p className="text-text-primary text-center text-base leading-relaxed">{back}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav buttons */}
      <div className="flex justify-center gap-3">
        <button onClick={prev} className="glass border border-border text-text-secondary px-5 py-2 rounded-xl text-sm hover:text-text-primary hover:border-border-bright transition-all">← Prev</button>
        <button onClick={reshuffle} className="glass border border-border text-text-secondary px-5 py-2 rounded-xl text-sm hover:text-text-primary hover:border-border-bright transition-all">⇄ Shuffle</button>
        <button onClick={next} className="glass border border-border text-text-secondary px-5 py-2 rounded-xl text-sm hover:text-text-primary hover:border-border-bright transition-all">Next →</button>
      </div>
    </div>
  )
}