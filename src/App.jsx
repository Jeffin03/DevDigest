import { useState, useEffect } from 'react'
import Nav from './components/Nav'
import Home from './components/Home'
import Glossary from './components/Glossary'
import Quiz from './components/Quiz'
import Cases from './components/Cases'

export default function App() {
  const [section, setSection] = useState('home')
  const [terms, setTerms] = useState([])
  const [cases, setCases] = useState([])
  const [glossarySearch, setGlossarySearch] = useState('')

  useEffect(() => {
    fetch('./CS_Glossary.json?t=' + Date.now())
      .then(r => r.ok ? r.json() : [])
      .then(data => setTerms(data.filter(t => t.topic).reverse()))
      .catch(() => setTerms([]))

    fetch('./CaseStudies.json?t=' + Date.now())
      .then(r => r.ok ? r.json() : [])
      .then(rows => {
        const map = {}
        rows.filter(r => r.id).forEach(row => {
          if (!map[row.id] && row.title) {
            map[row.id] = { id: row.id, title: row.title, type: row.type,
              severity: row.severity, year: row.year, affected: row.affected,
              summary: row.summary, source_url: row.source_url, cve_id: row.cve_id, events: [] }
          }
          if (row.event_date && row.event_title && map[row.id]) {
            map[row.id].events.push({ date: row.event_date, title: row.event_title, desc: row.event_desc })
          }
        })
        setCases(Object.values(map).sort((a, b) => (b.year || '').localeCompare(a.year || '')))
      })
      .catch(() => setCases([]))
  }, [])

  const goToTerm = (topic) => {
    setGlossarySearch(topic)
    setSection('glossary')
  }

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Background mesh */}
      <div className="fixed inset-0 bg-mesh pointer-events-none z-0" />

      <div className="relative z-10">
        <Nav section={section} setSection={setSection} />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          {section === 'home' && (
            <Home terms={terms} cases={cases} onGoTerm={goToTerm} />
          )}
          {section === 'glossary' && (
            <Glossary terms={terms} initialSearch={glossarySearch} onGoTerm={goToTerm} />
          )}
          {section === 'quiz' && (
            <Quiz terms={terms} />
          )}
          {section === 'cases' && (
            <Cases cases={cases} />
          )}
        </main>

        <footer className="text-center py-8 text-text-muted text-xs border-t border-border-subtle mt-8">
          DevDigest • Definitions sourced from Wikipedia • Security data via GitHub Advisory & NVD
        </footer>
      </div>
    </div>
  )
}
