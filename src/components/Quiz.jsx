import { useState, useEffect, useCallback } from 'react'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

// ── FLASHCARD MODE ──
function Flashcard({ terms }) {
  const [deck, setDeck] = useState(() => shuffle(terms))
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [dir, setDir] = useState('term-def')

  const card = deck[idx] || null

  const next = () => { setFlipped(false); setTimeout(() => setIdx(i => (i + 1) % deck.length), 150) }
  const prev = () => { setFlipped(false); setTimeout(() => setIdx(i => (i - 1 + deck.length) % deck.length), 150) }
  const reshuffle = () => { setDeck(shuffle(terms)); setIdx(0); setFlipped(false) }

  if (!card) return null

  const front = dir === 'term-def' ? card.topic : card.definition
  const back  = dir === 'term-def' ? card.definition : card.topic

  return (
    <div>
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
      <div className="relative h-64 cursor-pointer mb-6 perspective-[1200px]" onClick={() => setFlipped(f => !f)}>
        <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`}>
          <div className="flashcard-face glass border border-border">
            <p className="text-xs uppercase tracking-widest text-text-muted mb-4">{dir === 'term-def' ? 'Term' : 'Definition'}</p>
            <p className="font-display text-2xl font-bold text-text-primary text-center">{front}</p>
            <p className="text-text-muted text-xs mt-6">Click to reveal</p>
          </div>
          <div className="flashcard-face flashcard-back glass border border-accent-violet/30 bg-accent-violet/5">
            <p className="text-xs uppercase tracking-widest text-accent-violet-light mb-4">{dir === 'term-def' ? 'Definition' : 'Term'}</p>
            <p className="text-text-primary text-center text-base leading-relaxed">{back}</p>
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

// ── MULTIPLE CHOICE MODE ──
function MultipleChoice({ terms }) {
  const [pool, setPool] = useState(() => shuffle(terms))
  const [qIdx, setQIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [chosen, setChosen] = useState(null)
  const [dir, setDir] = useState('term-def')

  const buildQuestion = useCallback(() => {
    if (pool.length < 4) return null
    const correct = pool[qIdx % pool.length]
    const others = shuffle(terms.filter(t => t.topic !== correct.topic)).slice(0, 3)
    return { correct, options: shuffle([correct, ...others]) }
  }, [pool, qIdx, terms])

  const [question, setQuestion] = useState(() => buildQuestion())

  const handleAnswer = (opt) => {
    if (chosen) return
    setChosen(opt.topic)
    setTotal(t => t + 1)
    if (opt.topic === question.correct.topic) setScore(s => s + 1)
  }

  const next = () => {
    const nextIdx = qIdx + 1
    setQIdx(nextIdx)
    if (nextIdx >= pool.length) setPool(shuffle(terms))
    setChosen(null)
    setTimeout(() => setQuestion(buildQuestion()), 0)
  }

  useEffect(() => { setQuestion(buildQuestion()) }, [qIdx, pool])

  if (!question) return <p className="text-text-muted text-center py-8">Need at least 4 terms to play.</p>

  const { correct, options } = question

  return (
    <div>
      {/* Dir toggle + score */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-2">
          {[['term-def', 'Term → Definition'], ['def-term', 'Definition → Term']].map(([d, label]) => (
            <button key={d} onClick={() => { setDir(d); setChosen(null) }}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${dir === d ? 'border-accent-violet bg-accent-violet/10 text-accent-violet-light' : 'border-border text-text-muted hover:border-border-bright'}`}>
              {label}
            </button>
          ))}
        </div>
        {total > 0 && (
          <span className="font-mono text-sm text-accent-green">{score}/{total} correct</span>
        )}
      </div>

      {/* Question */}
      <div className="glass rounded-xl p-6 mb-4 border border-border">
        <p className="text-text-muted text-xs uppercase tracking-wider mb-3">
          {dir === 'term-def' ? 'What is…' : 'Which term matches this definition?'}
        </p>
        <p className="font-display text-xl font-bold text-text-primary">
          {dir === 'term-def' ? `"${correct.topic}"` : correct.definition}
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {options.map(opt => {
          const isCorrect = opt.topic === correct.topic
          const isChosen = opt.topic === chosen
          let cls = 'glass border border-border text-text-secondary hover:text-text-primary hover:border-border-bright'
          if (chosen) {
            if (isCorrect) cls = 'border border-accent-green bg-accent-green/10 text-accent-green'
            else if (isChosen) cls = 'border border-accent-red bg-accent-red/10 text-accent-red'
            else cls = 'glass border border-border text-text-muted opacity-50'
          }
          return (
            <button key={opt.topic} onClick={() => handleAnswer(opt)} disabled={!!chosen}
              className={`text-left rounded-xl p-4 text-sm transition-all ${cls}`}>
              {dir === 'term-def' ? opt.definition : opt.topic}
            </button>
          )
        })}
      </div>

      {chosen && (
        <div className="flex justify-end">
          <button onClick={next}
            className="bg-accent-violet hover:bg-violet-700 text-white text-sm font-medium px-5 py-2 rounded-xl transition-all">
            Next Question →
          </button>
        </div>
      )}
    </div>
  )
}

// ── QUIZ WRAPPER ──
export default function Quiz({ terms }) {
  const [mode, setMode] = useState('flashcard')

  if (terms.length === 0) return (
    <div className="text-center py-20 text-text-muted">
      <div className="text-4xl mb-3">📭</div>
      <p>No terms loaded yet. Run the Glossary collector first.</p>
    </div>
  )

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-gradient mb-2">Quiz Mode</h1>
        <p className="text-text-secondary text-sm">Test your knowledge of CS terms</p>
      </div>

      {/* Mode switcher */}
      <div className="flex justify-center mb-8">
        <div className="glass rounded-xl p-1 flex gap-1 border border-border">
          {[['flashcard', '🃏 Flashcards'], ['multiple', '🎯 Multiple Choice']].map(([m, label]) => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${mode === m ? 'bg-accent-violet text-white' : 'text-text-secondary hover:text-text-primary'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'flashcard' ? <Flashcard terms={terms} /> : <MultipleChoice terms={terms} />}
    </div>
  )
}
