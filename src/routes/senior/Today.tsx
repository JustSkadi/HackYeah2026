import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Check, Download, Loader2, Microscope, Plus, Stethoscope, UserRound } from 'lucide-react'
import { useData, type TodayDose } from '../../lib/data'
import { db } from '../../lib/db'
import { now } from '../../lib/clock'
import { canConfirm, hhmm } from '../../lib/doses'
import { importFromIkp } from '../../lib/ikp'
import { Logo, StatusBar } from '../../components/ui'
import { PomocBar } from '../../components/senior/SeniorShell'

const HEALTH_TILES = [
  { to: '/senior/kalendarz', label: 'Kalendarz', icon: CalendarDays },
  { to: '/senior/wizyty', label: 'Wizyty', icon: Stethoscope },
  { to: '/senior/badania', label: 'Badania', icon: Microscope },
  { to: '/senior/lekarze', label: 'Lekarze', icon: UserRound },
]

export default function SeniorToday() {
  const { todayDoses, current, snap } = useData()
  // wzięte leki spadają na dół listy (sort stabilny - reszta zostaje w kolejności godzin)
  const ordered = [...todayDoses].sort((a, b) => Number(a.status === 'taken') - Number(b.status === 'taken'))
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
    <main className="mx-auto flex min-h-full max-w-md flex-col bg-white pb-36 text-[22px]">
      <StatusBar />
      <header className="flex justify-center px-5 pb-2 pt-3">
        <Logo className="text-[34px]" />
      </header>

      {/* menu "Moje zdrowie" - u góry, ale kompaktowe, żeby głównym elementem zostały leki */}
      <nav aria-label="Moje zdrowie" className="grid grid-cols-2 gap-2 px-5 pt-2">
        {HEALTH_TILES.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex h-[76px] flex-col items-center justify-center gap-1 rounded-[10px] border-2 border-primary-soft bg-primary-soft/30 px-2 text-xl font-bold text-navy active:scale-[0.98]"
          >
            <Icon size={28} strokeWidth={1.75} className="shrink-0 text-primary" />
            {label}
          </Link>
        ))}
      </nav>

      <section className="flex flex-col gap-4 px-5 pt-6">
        <h1 className="text-[28px] font-bold text-navy">Lekarstwa na dziś</h1>
        {todayDoses.length === 0 && (
          <p className="rounded-[10px] bg-primary-soft/40 p-6 text-center text-muted">
            {snap.medications.length === 0 ? 'Nie ma jeszcze żadnych leków.' : 'Na dziś nie ma więcej leków.'}
          </p>
        )}
        {ordered.map((t) => (
          <DoseCard key={t.dose.id} item={t} current={current} />
        ))}
        <Link
          to="/senior/dodaj-lek"
          className="flex min-h-16 items-center justify-center gap-3 rounded-[10px] border-2 border-primary px-4 py-3 text-2xl font-bold text-primary active:scale-[0.98]"
        >
          <Plus size={30} strokeWidth={2.5} /> Dodaj lek ręcznie
        </Link>
        <button
          onClick={runImport}
          disabled={importing}
          className="flex min-h-16 items-center justify-center gap-3 rounded-[10px] bg-primary px-4 py-3 text-2xl font-bold text-white active:scale-[0.98] disabled:opacity-80"
        >
          {importing ? <Loader2 size={30} className="shrink-0 animate-spin" /> : <Download size={30} className="shrink-0" />}
          {importing ? 'Łączenie z Internetowym Kontem Pacjenta…' : 'Importuj z IKP'}
        </button>
      </section>

      <PomocBar />
    </main>
  )
}

function DoseCard({ item, current }: { item: TodayDose; current: Date }) {
  const { dose, med, status } = item
  const styles = {
    taken: 'border-success bg-success-soft',
    due: 'border-primary bg-primary-soft animate-pulse',
    missed: 'border-warning bg-warning-soft',
    upcoming: 'border-primary-soft bg-white',
  }[status]
  const label = {
    taken: `Wzięte ✅ ${dose.taken_at ? hhmm(dose.taken_at) : ''}`,
    due: 'Weź teraz',
    missed: 'Spóźnione - weź teraz',
    upcoming: `O godzinie ${hhmm(dose.scheduled_at)}`,
  }[status]

  return (
    <article className={`rounded-[10px] border-4 p-5 ${styles}`}>
      <div className="flex items-center gap-4">
        <span className="h-14 w-14 shrink-0 rounded-full border-2 border-navy/30" style={{ background: med.color ?? '#fff' }} aria-hidden />
        <div className="min-w-0">
          <p className="text-[26px] font-bold leading-tight break-words">{med.name}</p>
          <p className="text-muted">
            {med.dose_label} · {hhmm(dose.scheduled_at)}
          </p>
        </div>
      </div>
      <p className="mt-3 font-semibold">{label}</p>
      {canConfirm(dose, current) && (
        <button
          onClick={() => db.markTaken(dose.id, now().toISOString())}
          className="mt-4 flex h-20 w-full items-center justify-center gap-3 rounded-[10px] bg-success px-4 text-[28px] font-bold text-white active:scale-[0.98]"
        >
          <Check size={36} strokeWidth={3} /> Wziąłem
        </button>
      )}
    </article>
  )
}
