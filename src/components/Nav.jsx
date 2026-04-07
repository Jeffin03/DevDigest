export default function Nav({ section, setSection }) {
  const links = [
    { id: 'home',     label: '🏠 Home' },
    { id: 'glossary', label: '📖 Glossary' },
    { id: 'quiz',     label: '🧠 Quiz' },
    { id: 'cases',    label: '🔐 Cases' },
  ]

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border-subtle flex items-center justify-between px-4 sm:px-8 h-16">
      <button
        onClick={() => setSection('home')}
        className="font-display font-bold text-2xl text-gradient-violet tracking-tight"
      >
        DevDigest
      </button>
      <div className="flex gap-1">
        {links.map(l => (
          <button
            key={l.id}
            onClick={() => setSection(l.id)}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
              ${section === l.id
                ? 'bg-bg-elevated text-text-primary border border-border'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent'
              }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
