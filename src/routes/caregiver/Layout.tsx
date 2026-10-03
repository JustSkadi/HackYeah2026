import { useEffect, useRef } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { CalendarDays, Landmark, LayoutDashboard, Phone, Pill, Stethoscope, Video } from 'lucide-react'
import { useData } from '../../lib/data'
import { db } from '../../lib/db'
import { now } from '../../lib/clock'
import { config } from '../../lib/config'
import { playAlert } from '../../lib/alert'
import { firstName, fmtTime } from '../../lib/format'

const nav = [
  { to: '/opiekun', label: 'Pulpit', icon: LayoutDashboard, end: true },
  { to: '/opiekun/leki', label: 'Leki', icon: Pill },
  { to: '/opiekun/kalendarz', label: 'Kalendarz', icon: CalendarDays },
  { to: '/opiekun/lekarze', label: 'Lekarze', icon: Stethoscope },
  { to: '/opiekun/programy', label: 'Programy', icon: Landmark },
]

export default function CaregiverLayout() {
  const { snap, missed, current } = useData()
  const help = snap.helpRequests[0]
  useAlertSound(snap.helpRequests.length + missed.length)

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col bg-slate-50 pb-20">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">MójSenior · Opiekun</p>
          <p className="font-bold">{snap.senior?.name ?? 'Senior'}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm tabular-nums text-muted">{fmtTime(current)}</span>
      </header>

      <main className="flex-1 p-4">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 mx-auto grid max-w-md grid-cols-5 border-t bg-white">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-xs ${isActive ? 'text-primary' : 'text-muted'}`}
          >
            <Icon size={22} /> {label}
          </NavLink>
        ))}
      </nav>

      {help && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-danger p-8 text-center text-white">
          <span className="h-20 w-20 animate-ping rounded-full bg-white/50" />
          <p className="text-3xl font-bold">{snap.senior ? firstName(snap.senior.name) : 'Senior'} prosi o pomoc!</p>
          <div className="grid w-full max-w-xs gap-3">
            {config.dailyRoomUrl && (
              <a href={config.dailyRoomUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-white py-4 text-xl font-bold text-danger">
                <Video /> Dołącz do wideo
              </a>
            )}
            <button onClick={() => db.resolveHelpRequests(now().toISOString())} className="rounded-2xl border-2 border-white py-3 font-semibold">
              Zamknij alert
            </button>
          </div>
          {!config.dailyRoomUrl && (
            <p className="flex items-center gap-2 text-sm text-white/80">
              <Phone size={16} /> Ustaw VITE_DAILY_ROOM_URL, żeby włączyć wideo
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/** Dźwięk, gdy liczba alertów rośnie. */
function useAlertSound(count: number) {
  const prev = useRef(count)
  useEffect(() => {
    if (count > prev.current) playAlert()
    prev.current = count
  }, [count])
}
