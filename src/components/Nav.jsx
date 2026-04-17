export default function Nav({ section, setSection }) {
  const links = [
    { id: 'home',     label: 'Home', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ) },
    { id: 'glossary', label: 'Glossary', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ) },
    { id: 'quiz',     label: 'Flashcards', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ) },
    { id: 'cases',    label: 'Security Feed', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ) },
  ]

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border-subtle flex items-center justify-between px-4 sm:px-10 h-20">
      <button
        onClick={() => setSection('home')}
        className="font-display font-bold text-2xl text-gradient-violet tracking-tight hover:opacity-80 transition-opacity"
      >
        DevDigest
      </button>
      <div className="flex gap-2 sm:gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md shadow-inner">
        {links.map(l => (
          <button
            key={l.id}
            onClick={() => setSection(l.id)}
            className={`group flex items-center gap-0 hover:gap-3 px-3 py-2.5 rounded-xl transition-all duration-500 ease-out
              ${section === l.id
                ? 'bg-accent-violet text-white shadow-lg shadow-accent-violet/25 border border-accent-violet-light/50 gap-3'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent'
              }`}
          >
            <span className={`transition-all duration-300 ${section === l.id ? 'opacity-100 scale-110' : 'opacity-60 group-hover:opacity-100 group-hover:scale-110'}`}>
              {l.icon}
            </span>
            <span className={`overflow-hidden whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-500 ease-out
              ${section === l.id 
                ? 'max-w-xs opacity-100 ml-0' 
                : 'max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-0'
              }`}
            >
              {l.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}
