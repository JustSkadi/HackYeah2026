import { useState } from 'react'
import { addDays } from 'date-fns'
import { ChevronDown, FileText } from 'lucide-react'
import { useData } from '../../lib/data'
import { fmtDate } from '../../lib/format'
import { NeedsIkpImport, PageTitle } from '../../components/ui'
import records from '../../data/ikp-records.json'

export default function Documents() {
  const { current } = useData()
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <PageTitle title="Dokumenty" subtitle="Dokumentacja medyczna z Internetowego Konta Pacjenta" />
      <NeedsIkpImport>
        {records.documents.map((d) => {
          const expanded = open === d.id
          return (
            <article key={d.id} className="card">
              <button onClick={() => setOpen(expanded ? null : d.id)} className="flex w-full items-start gap-3 text-left">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-primary-soft/60 text-primary">
                  <FileText size={20} strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-accent">{d.type}</span>
                  <span className="block font-semibold">{d.title}</span>
                  <span className="block text-sm text-muted">
                    {d.author} · {fmtDate(addDays(current, -d.days_ago))}
                  </span>
                </span>
                <ChevronDown size={20} className={`mt-2 shrink-0 text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
              {expanded && <p className="mt-3 rounded-[10px] bg-primary-soft/30 p-3 text-sm">{d.summary}</p>}
            </article>
          )
        })}
      </NeedsIkpImport>
    </div>
  )
}
