import { addDays } from 'date-fns'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useData } from '../../lib/data'
import { fmtDate } from '../../lib/format'
import { NeedsIkpImport, PageTitle } from '../../components/ui'
import records from '../../data/ikp-records.json'

/** 1 wynik, 2-4 wyniki, 5+ wyników (z wyjątkiem 12-14). */
function resultsWord(n: number) {
  if (n === 1) return 'wynik'
  const lastDigit = n % 10
  const lastTwo = n % 100
  return lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14) ? 'wyniki' : 'wyników'
}

export default function Tests() {
  const { current } = useData()
  const outOfNorm = records.tests.flatMap((t) => t.results).filter((r) => r.flag === 'high').length

  return (
    <div className="flex flex-col gap-4">
      <PageTitle title="Badania" subtitle="Wyniki badań z Internetowego Konta Pacjenta" />
      <NeedsIkpImport>
        {outOfNorm > 0 && (
          <div className="flex items-center gap-2 rounded-[10px] bg-warning-soft p-3 text-sm font-semibold text-warning">
            <AlertTriangle size={18} className="shrink-0" /> {outOfNorm} {resultsWord(outOfNorm)} poza normą - warto pokazać lekarzowi
          </div>
        )}
        {records.tests.map((t) => (
          <article key={t.id} className="card">
            <h2 className="font-semibold">{t.name}</h2>
            <p className="text-sm text-muted">
              {fmtDate(addDays(current, -t.days_ago))} · {t.lab}
            </p>
            <ul className="mt-3 flex flex-col gap-2 border-t pt-3">
              {t.results.map((r) => (
                <li key={r.param} className="flex items-start gap-2 text-sm">
                  {r.flag === 'high' ? (
                    <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" aria-label="Poza normą" />
                  ) : (
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" aria-label="W normie" />
                  )}
                  <span className="flex-1">{r.param}</span>
                  <span className="text-right">
                    <b className={r.flag === 'high' ? 'text-warning' : ''}>
                      {r.value} {r.unit}
                    </b>
                    {r.norm && <span className="block text-xs text-muted">norma {r.norm}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </NeedsIkpImport>
    </div>
  )
}
