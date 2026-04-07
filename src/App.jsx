import { useState, useEffect, lazy, Suspense } from 'react'
import Nav from './components/Nav'
import Home from './components/Home'

// Lazy load sections that aren't needed on first paint
const Glossary = lazy(() => import('./components/Glossary'))
const Quiz     = lazy(() => import('./components/Quiz'))
const Cases    = lazy(() => import('./components/Cases'))

function SectionSkeleton() {
  return (
    <div className="animate-pulse space-y-4 pt-4">
      <div className="h-8 w-48 bg-white/5 rounded-xl mx-auto" />
      <div className="h-4 w-64 bg-white/5 rounded-lg mx-auto" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 bg-white/5 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

function parseCases(rows) {
  const map = {}
  rows.filter(r => r.id).forEach(row => {
    if (!map[row.id] && row.title) {
      map[row.id] = {
        id: row.id, title: row.title, type: row.type,
        severity: row.severity, year: row.year, affected: row.affected,
        summary: row.summary, source_url: row.source_url, cve_id: row.cve_id, events: []
      }
    }
    if (row.event_date && row.event_title && map[row.id]) {
      map[row.id].events.push({ date: row.event_date, title: row.event_title, desc: row.event_desc })
    }
  })
  return Object.values(map).sort((a, b) => (b.year || '').localeCompare(a.year || ''))
}

export default function App() {
  const [section, setSection] = useState('home')
  const [terms, setTerms] = useState([])
  const [cases, setCases] = useState([])
  const [termsLoading, setTermsLoading] = useState(true)
  const [casesLoading, setCasesLoading] = useState(true)
  const [glossarySearch, setGlossarySearch] = useState('')

  // Fetch glossary immediately — needed for Home hero
  useEffect(() => {
    fetch('./CS_Glossary.json')
      .then(r => r.ok ? r.json() : [])
      .then(data => setTerms(data.filter(t => t.topic).reverse()))
      .catch(() => setTerms([]))
      .finally(() => setTermsLoading(false))
  }, [])

  // Defer cases fetch until Cases section is first visited
  useEffect(() => {
    if (section !== 'cases' && section !== 'home') return
    if (!casesLoading && cases.length > 0) return
    fetch('./CaseStudies.json')
      .then(r => r.ok ? r.json() : [])
      .then(rows => setCases(parseCases(rows)))
      .catch(() => setCases([]))
      .finally(() => setCasesLoading(false))
  }, [section])

  const goToTerm = (topic) => {
    setGlossarySearch(topic)
    setSection('glossary')
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="fixed inset-0 bg-mesh pointer-events-none z-0" />

      <div className="relative z-10">
        <Nav section={section} setSection={setSection} />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          {/* Home is eagerly loaded — no Suspense needed */}
          {section === 'home' && (
            <Home
              terms={terms}
              cases={cases}
              loading={termsLoading}
              onGoTerm={goToTerm}
            />
          )}

          {/* Other sections are lazy — show skeleton while chunk loads */}
          <Suspense fallback={<SectionSkeleton />}>
            {section === 'glossary' && (
              <Glossary terms={terms} initialSearch={glossarySearch} onGoTerm={goToTerm} />
            )}
            {section === 'quiz' && (
              <Quiz terms={terms} />
            )}
            {section === 'cases' && (
              <Cases cases={cases} loading={casesLoading} />
            )}
          </Suspense>
        </main>

        <footer className="text-center py-8 text-text-muted text-xs border-t border-border-subtle mt-8">
          DevDigest • Definitions sourced from Wikipedia • Security data via GitHub Advisory & NVD
        </footer>
      </div>
    </div>
  )
}
