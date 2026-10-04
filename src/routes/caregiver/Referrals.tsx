import { addDays } from 'date-fns'
import { ExternalLink } from 'lucide-react'
import { useData } from '../../lib/data'
import { fmtDate, fmtDateYear } from '../../lib/format'
import { NeedsIkpImport, PageTitle } from '../../components/ui'
import records from '../../data/ikp-records.json'

const NFZ_TERMS_URL = 'https://terminyleczenia.nfz.gov.pl'

const STATUS = {
  do_realizacji: { label: 'Do zrealizowania', cls: 'bg-warning-soft text-warning', order: 0 },
  zarejestrowane: { label: 'Zarejestrowane', cls: 'bg-primary-soft text-primary', order: 1 },
  zrealizowane: { label: 'Zrealizowane', cls: 'bg-primary-soft/40 text-muted', order: 2 },
} as const

type Status = keyof typeof STATUS

export default function Referrals() {
  const { current } = useData()
  const referrals = [...records.referrals].sort((a, b) => STATUS[a.status as Status].order - STATUS[b.status as Status].order)

  return (
    <div className="flex flex-col gap-4">
      <PageTitle title="Skierowania" subtitle="E-skierowania z Internetowego Konta Pacjenta" />
      <NeedsIkpImport>
        {referrals.map((r) => {
          const status = STATUS[r.status as Status]
          const issued = addDays(current, -r.issued_days_ago)
          return (
            <article key={r.id} className={`card ${r.status === 'zrealizowane' ? 'opacity-70' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold">{r.title}</h2>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${status.cls}`}>{status.label}</span>
              </div>
              <p className="text-sm text-muted">{r.reason}</p>
              <p className="mt-2 text-sm">
                Wystawił: {r.doctor} · {fmtDate(issued)}
              </p>
              <div className="mt-3 flex items-center justify-between gap-3 rounded-[10px] bg-primary-soft/30 px-3 py-2">
                <span className="text-sm text-muted">Kod skierowania</span>
                <span className="text-2xl font-bold tracking-[0.3em] text-navy">{r.code}</span>
              </div>
              {r.status === 'do_realizacji' && (
                <a
                  href={NFZ_TERMS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 rounded-[10px] bg-primary py-2.5 text-sm font-semibold text-white"
                >
                  Sprawdź terminy w NFZ <ExternalLink size={15} />
                </a>
              )}
              {r.status !== 'zrealizowane' && (
                <p className="mt-2 text-xs text-muted">Ważne do {fmtDateYear(addDays(issued, r.valid_days))}</p>
              )}
            </article>
          )
        })}
      </NeedsIkpImport>
    </div>
  )
}
