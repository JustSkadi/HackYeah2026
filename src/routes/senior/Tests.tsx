import { addDays, format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { AlertTriangle, CheckCircle2, Stethoscope } from 'lucide-react'
import { useData } from '../../lib/data'
import SeniorShell, { SeniorEmpty } from '../../components/senior/SeniorShell'
import records from '../../data/ikp-records.json'

export default function SeniorTests() {
  const { snap, current } = useData()

  return (
    <SeniorShell title="Moje badania">
      <p className="flex items-start gap-3 rounded-[10px] border-4 border-primary bg-primary-soft/40 p-4 text-xl font-bold">
        <Stethoscope size={30} className="mt-0.5 shrink-0 text-primary" />
        Wyniki zawsze skonsultuj z lekarzem.
      </p>
      {snap.medications.length === 0 ? (
        <SeniorEmpty text="Wyniki pojawią się, gdy opiekun pobierze dane z IKP." />
      ) : (
        records.tests.map((t) => {
          const anyHigh = t.results.some((r) => r.flag === 'high')
          return (
            <article key={t.id} className={`rounded-[10px] border-4 p-5 ${anyHigh ? 'border-warning bg-warning-soft' : 'border-success/40 bg-success-soft/50'}`}>
              <p className="text-2xl font-bold">{t.name}</p>
              <p className="text-muted">{format(addDays(current, -t.days_ago), 'd MMMM', { locale: pl })}</p>
              <p className={`mt-3 flex items-center gap-2 font-bold ${anyHigh ? 'text-warning' : 'text-success'}`}>
                {anyHigh ? <AlertTriangle size={28} /> : <CheckCircle2 size={28} />}
                {anyHigh ? 'Skonsultuj z lekarzem' : 'Wszystko w normie'}
              </p>
              <ul className="mt-3 flex flex-col gap-2 text-xl">
                {t.results.map((r) => (
                  <li key={r.param} className="flex flex-wrap justify-between gap-x-3">
                    <span>{r.param}</span>
                    <b className={r.flag === 'high' ? 'text-warning' : ''}>
                      {r.value} {r.unit}
                    </b>
                  </li>
                ))}
              </ul>
            </article>
          )
        })
      )}
    </SeniorShell>
  )
}
