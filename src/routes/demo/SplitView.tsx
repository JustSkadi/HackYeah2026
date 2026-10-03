import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FastForward, RotateCcw, Timer } from 'lucide-react'
import { useData } from '../../lib/data'
import { db } from '../../lib/db'
import { getClockOffset, offsetForTimeToday } from '../../lib/clock'
import { fmtDay, fmtTime } from '../../lib/format'

const PRESETS = ['07:55', '08:35', '19:55', '20:35']

export default function SplitView() {
  const { current } = useData()
  const [busy, setBusy] = useState(false)

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col gap-6 bg-primary-soft/40 p-4 lg:flex-row lg:items-start lg:justify-center lg:p-8">
      <Phone title="Senior" src="/senior" />
      <Phone title="Opiekun" src="/opiekun" />

      <aside className="flex w-full flex-col gap-4 rounded-2xl bg-white p-5 shadow lg:w-72">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Panel demo</p>
          <p className="text-4xl font-bold tabular-nums">{fmtTime(current)}</p>
          <p className="text-sm text-muted first-letter:uppercase">{fmtDay(current)}</p>
          <p className="mt-1 text-xs text-muted">Przesunięcie: {getClockOffset()} min</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((t) => (
            <button key={t} disabled={busy} onClick={() => run(() => db.setDemoOffset(offsetForTimeToday(t)))} className="flex items-center justify-center gap-1 rounded-lg border py-2 font-semibold">
              <Timer size={16} /> {t}
            </button>
          ))}
          <button disabled={busy} onClick={() => run(() => db.setDemoOffset(getClockOffset() + 30))} className="flex items-center justify-center gap-1 rounded-lg border py-2 font-semibold">
            <FastForward size={16} /> +30 min
          </button>
          <button disabled={busy} onClick={() => run(() => db.setDemoOffset(0))} className="rounded-lg border py-2 font-semibold">
            Teraz
          </button>
        </div>

        <button
          disabled={busy}
          onClick={() => run(() => db.resetDemo(new Date()))}
          className="flex items-center justify-center gap-2 rounded-lg bg-danger py-2.5 font-semibold text-white"
        >
          <RotateCcw size={16} /> Resetuj demo
        </button>

        <p className="text-xs text-muted">
          Tryb danych: <b>{db.mode === 'supabase' ? 'Supabase (realtime, wiele urządzeń)' : 'lokalny (tylko ta przeglądarka)'}</b>
        </p>
        <Link to="/" className="text-sm text-muted underline">
          ← Wybór roli
        </Link>
      </aside>
    </div>
  )
}

function Phone({ title, src }: { title: string; src: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="font-semibold text-muted">{title}</p>
      <div className="h-[780px] w-[380px] max-w-full overflow-hidden rounded-[2.5rem] border-[10px] border-ink bg-white shadow-2xl">
        <iframe src={src} title={title} className="h-full w-full" allow="camera; microphone; fullscreen" />
      </div>
    </div>
  )
}
