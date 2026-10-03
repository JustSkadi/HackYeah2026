import { useState } from 'react'
import { parseISO } from 'date-fns'
import { Download, Loader2, ShoppingCart } from 'lucide-react'
import { useData } from '../../lib/data'
import { config, PHARMACY_SEARCH_URL } from '../../lib/config'
import { forecastStock } from '../../lib/stock'
import { importFromIkp } from '../../lib/ikp'
import { fmtDate } from '../../lib/format'

export default function Medications() {
  const { snap, current, age } = useData()
  const [importing, setImporting] = useState(false)

  const runImport = async () => {
    setImporting(true)
    try {
      await importFromIkp()
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={runImport}
        disabled={importing}
        className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-white disabled:opacity-70"
      >
        {importing ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
        {importing ? 'Łączenie z Internetowym Kontem Pacjenta…' : 'Importuj z IKP'}
      </button>

      {snap.medications.map((med) => {
        const f = forecastStock(med, current, config.refillWarnDays)
        const pct = Math.round((f.expectedLeft / f.totalUnits) * 100)
        const bar = f.needsRefill ? 'bg-warning' : 'bg-success'
        return (
          <article key={med.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="mt-1 h-8 w-8 shrink-0 rounded-full border" style={{ background: med.color ?? '#fff' }} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold">{med.name}</h2>
                  {med.free_65 && age !== null && age >= 65 && (
                    <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">Bezpłatny 65+</span>
                  )}
                </div>
                <p className="text-sm text-muted">
                  {med.active_substance} · {med.dose_label} o {med.times.join(', ')}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex justify-between text-sm">
                <span>
                  Powinno zostać: <b>{f.expectedLeft}</b> / {f.totalUnits}
                </span>
                <span className="text-muted">do {fmtDate(f.runoutDate)}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-100">
                <div className={`h-2 rounded-full ${bar}`} style={{ width: `${pct}%` }} />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm text-muted">
              <span>
                Kupiono {fmtDate(parseISO(med.purchase_date))}
                {med.pharmacy ? ` · ${med.pharmacy}` : ''}
              </span>
              <a href={med.buy_online_url ?? PHARMACY_SEARCH_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary">
                <ShoppingCart size={16} /> Kup
              </a>
            </div>
          </article>
        )
      })}
    </div>
  )
}
