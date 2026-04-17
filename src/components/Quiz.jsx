import { useState } from 'react'

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

export default function Quiz({ terms }) {
  const [deck, setDeck] = useState(() => shuffle(terms))
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

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

  const front = card.topic
  const back = card.definition

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="relative text-center mb-12 py-4">
        <div className="absolute inset-0 -z-10 bg-mesh opacity-20 blur-3xl transform -translate-y-1/2 scale-150" />
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-gradient mb-4">Neural Flashcards</h1>
        <p className="text-text-secondary text-base leading-relaxed">Systematically testing your technical comprehension</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner">
        <div className="flex items-center gap-3">
           <div className="p-2 rounded-xl bg-accent-violet/10 text-accent-violet-light">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
             </svg>
           </div>
           <span className="text-xs uppercase tracking-widest text-text-primary font-bold">Standard Insight Mode</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-border">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-violet animate-pulse" />
          <span className="text-text-muted text-[10px] font-bold font-mono tracking-tighter uppercase">Protocol {idx + 1} / {deck.length}</span>
        </div>
      </div>

      {/* Card */}
      <div className="relative cursor-pointer mb-10 perspective-[2000px] group" style={{ height: '320px' }} onClick={() => setFlipped(f => !f)}>
        <div className={`flashcard-inner ${flipped ? 'flipped' : ''} duration-700`}>
          <div className="flashcard-face glass border-accent-violet-light/20 shadow-2xl group-hover:border-accent-violet-light/40 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-violet to-transparent opacity-20" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-accent-violet-light font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-violet-light" />
              Target Subject
            </p>
            <div className="overflow-y-auto max-h-56 w-full text-center scrollbar-thin px-4">
              <p className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">{front}</p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
              Reveal Insight 
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
          <div className="flashcard-face flashcard-back border-accent-green/20 shadow-2xl" style={{ background: 'linear-gradient(135deg, #0d1424 0%, #080c14 100%)' }}>
            <div className="absolute inset-0 bg-mesh opacity-10 blur-2xl" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-accent-green font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
              Resolution Definition
            </p>
            <div className="overflow-y-auto max-h-56 w-full text-center scrollbar-thin px-6">
              <p className="text-text-primary text-center text-lg sm:text-xl font-medium leading-relaxed opacity-90">{back}</p>
            </div>
            <div className="mt-8 px-4 py-1 rounded-full border border-accent-green/20 text-[10px] font-bold text-accent-green uppercase tracking-widest">
              Insight Confirmed
            </div>
          </div>
        </div>
      </div>

      {/* Nav buttons */}
      <div className="flex justify-center gap-4">
        <button onClick={prev} className="group glass border border-border text-text-secondary px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:text-white hover:border-border-bright transition-all flex items-center gap-2">
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        <button onClick={reshuffle} className="glass border border-border text-text-secondary px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:text-white hover:border-border-bright transition-all flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m0 0H15" />
          </svg>
          Reset
        </button>
        <button onClick={next} className="group glass border border-border text-text-secondary px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:text-white hover:border-border-bright transition-all flex items-center gap-2">
          Next
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  )
}