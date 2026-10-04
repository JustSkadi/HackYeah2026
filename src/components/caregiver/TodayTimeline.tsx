import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import type { TodayDose } from '../../lib/data'
import { hhmm, type DoseStatus } from '../../lib/doses'

const statusUi: Record<DoseStatus, { label: string; cls: string; icon: typeof Clock }> = {
  taken: { label: 'Wzięte', cls: 'bg-success-soft text-success', icon: CheckCircle2 },
  due: { label: 'Teraz', cls: 'bg-primary-soft text-primary', icon: Clock },
  missed: { label: 'Brak potwierdzenia', cls: 'bg-danger-soft text-danger', icon: AlertTriangle },
  upcoming: { label: 'Zaplanowane', cls: 'bg-primary-soft/40 text-muted', icon: Clock },
}

/** Oś dzisiejszych dawek ze statusami (karta "Dzisiaj"). */
export default function TodayTimeline({ doses }: { doses: TodayDose[] }) {
  return (
    <div className="card">
      <h3 className="mb-3 font-semibold text-navy">Dzisiaj</h3>
      {doses.length === 0 && <p className="text-sm text-muted">Brak dawek na dziś.</p>}
      <ol className="flex flex-col gap-2.5">
        {doses.map(({ dose, med, status }) => {
          const ui = statusUi[status]
          return (
            <li key={dose.id} className="flex items-center gap-3 text-sm">
              <span className="w-11 tabular-nums text-muted">{hhmm(dose.scheduled_at)}</span>
              <span className="h-3 w-3 shrink-0 rounded-full border" style={{ background: med.color ?? '#fff' }} />
              <span className="flex-1 truncate">{med.name}</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${ui.cls}`}>
                <ui.icon size={13} /> {status === 'taken' && dose.taken_at ? `${ui.label} ${hhmm(dose.taken_at)}` : ui.label}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
