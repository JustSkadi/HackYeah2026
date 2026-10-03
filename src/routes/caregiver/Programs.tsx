import { ExternalLink } from 'lucide-react'
import { useData } from '../../lib/data'
import programs from '../../data/programs.json'

interface Program {
  id: string
  title: string
  min_age: number
  sex: 'F' | 'M' | null
  summary: string
  action: string
  source_name: string
  source_url: string
  verified_at: string
}

export default function ProgramsPage() {
  const { snap, age } = useData()
  const sex = snap.senior?.sex ?? null
  const matching = (programs as Program[]).filter((p) => (age ?? 0) >= p.min_age && (!p.sex || p.sex === sex))

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Dopasowane do: {sex === 'F' ? 'kobieta' : sex === 'M' ? 'mężczyzna' : 'senior'}, {age} lat
      </p>
      {matching.map((p) => (
        <article key={p.id} className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="font-bold">{p.title}</h2>
          <p className="mt-1">{p.summary}</p>
          <p className="mt-2 text-sm font-semibold text-primary">{p.action}</p>
          <a href={p.source_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm text-muted underline">
            Źródło: {p.source_name} <ExternalLink size={14} />
          </a>
          <span className="ml-2 text-xs text-muted">sprawdzono {p.verified_at}</span>
        </article>
      ))}
    </div>
  )
}
