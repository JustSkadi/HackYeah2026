import { useState } from 'react'
import { parseISO } from 'date-fns'
import { Download, Loader2, Plus, RefreshCw, ShoppingCart } from 'lucide-react'
import MedicationForm from '../../components/MedicationForm'
import { useData } from '../../lib/data'
import { buyOnlineUrl, config } from '../../lib/config'
import { forecastStock } from '../../lib/stock'
import { importFromIkp } from '../../lib/ikp'
import { fmtDate } from '../../lib/format'
import { QuickTiles, Section } from '../../components/ui'
import TodayTimeline from '../../components/caregiver/TodayTimeline'

const PREVIEW = 2

export default function Medications() {
  const { snap, current, age, todayDoses } = useData()
  const [importing, setImporting] = useState(false)
  const [allStock, setAllStock] = useState(false)
  const [adding, setAdding] = useState(false)

  const runImport = async () => {
    setImporting(true)
    try {
      await importFromIkp()
    } finally {
      setImporting(false)
    }
  }

  const stock = snap.medications
    .map((med) => ({ med, f: forecastStock(med, current, config.refillWarnDays) }))
    .sort((a, b) => a.f.daysLeft - b.f.daysLeft)

  const hasMeds = snap.medications.length > 0

  return (
    <div className="flex flex-col gap-7">
      <QuickTiles />

      {!hasMeds || importing ? (
        <button
          onClick={runImport}
          disabled={importing}
          className="flex items-center justify-center gap-2 rounded-[10px] bg-primary py-3.5 font-semibold text-white disabled:opacity-70"
        >
          {importing ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
          {importing ? 'Łączenie z Internetowym Kontem Pacjenta…' : 'Importuj z IKP'}
        </button>
      ) : (
        <>
          <Section title="Lekarstwa" more={{ to: '/opiekun/kalendarz' }}>
            <TodayTimeline doses={todayDoses} />
          </Section>

          <Section
            title="Zaopatrzenie"
            more={stock.length > PREVIEW ? { onClick: () => setAllStock((v) => !v), label: allStock ? 'Zwiń' : 'Zobacz wszystkie' } : undefined}
          >
            {(allStock ? stock : stock.slice(0, PREVIEW)).map(({ med, f }) => {
              const pct = Math.round((f.expectedLeft / f.totalUnits) * 100)
              return (
                <article key={med.id} className="card">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 h-8 w-8 shrink-0 rounded-full border" style={{ background: med.color ?? '#fff' }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{med.name}</h3>
                        {med.free_65 && age !== null && age >= 65 && (
                          <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">Bezpłatny 65+</span>
                        )}
                      </div>
                      <p className="text-sm text-muted">
                        {[med.active_substance, `${med.dose_label} o ${med.times.join(', ')}`].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-sm">
                      <span>
                        Powinno zostać: <b>{f.expectedLeft}</b> / {f.totalUnits}
                      </span>
                      <span className={f.needsRefill ? 'font-semibold text-warning' : 'text-muted'}>do {fmtDate(f.runoutDate)}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-primary-soft/50">
                      <div className={`h-2 rounded-full ${f.needsRefill ? 'bg-warning' : 'bg-accent'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 text-sm text-muted">
                    <span className="min-w-0">
                      Kupiono {fmtDate(parseISO(med.purchase_date))}
                      {med.pharmacy ? ` · ${med.pharmacy}` : ''}
                    </span>
                    <a href={buyOnlineUrl(med)} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 font-semibold text-accent">
                      <ShoppingCart size={16} /> Kup
                    </a>
                  </div>
                </article>
              )
            })}
          </Section>

          <button onClick={runImport} className="flex items-center justify-center gap-2 text-sm font-medium text-accent">
            <RefreshCw size={15} /> Odśwież dane z IKP
          </button>
        </>
      )}

      {!importing &&
        (adding ? (
          <Section title="Nowy lek">
            <div className="card">
              <MedicationForm onDone={() => setAdding(false)} />
            </div>
          </Section>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center justify-center gap-2 rounded-[10px] border-2 border-primary py-3 font-semibold text-primary"
          >
            <Plus size={18} /> Dodaj lek ręcznie
          </button>
        ))}
    </div>
  )
}
