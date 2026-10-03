import { useEffect, useRef } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { CalendarDays, HandHeart, House, Phone, Pill, Video } from 'lucide-react'
import { useData } from '../../lib/data'
import { db } from '../../lib/db'
import { now } from '../../lib/clock'
import { config } from '../../lib/config'
import { playAlert } from '../../lib/alert'
import { firstName, fmtTime } from '../../lib/format'
import { Logo } from '../../components/ui'

// Lekarze są dostępni z kafelka na Pulpicie / w Lekach (układ z Figmy)
const nav = [
  { to: '/opiekun', label: 'Pulpit', icon: House, end: true },
  { to: '/opiekun/leki', label: 'Leki', icon: Pill },
  { to: '/opiekun/kalendarz', label: 'Kalendarz', icon: CalendarDays },
  { to: '/opiekun/programy', label: 'Programy', icon: HandHeart },
]

export default function CaregiverLayout() {
  const { snap, missed, current } = useData()
  const help = snap.helpRequests[0]
  useAlertSound(snap.helpRequests.length + missed.length)

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col bg-white pb-28">
      <header className="sticky top-0 z-10 flex flex-col items-center gap-1 bg-white/95 px-4 pb-3 pt-5 backdrop-blur">
        <Logo />
        <p className="text-xs text-muted">
          Opiekun · {snap.senior?.name ?? 'Senior'} · <span className="tabular-nums">{fmtTime(current)}</span>
        </p>
      </header>

      <main className="flex-1 px-5 pt-2">
        <Outlet />
      </main>

      {/* białe tło pod pływającym paskiem, żeby przewijana treść nie prześwitywała */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md bg-linear-to-t from-white from-70% to-white/0 px-5 pb-4 pt-6">
      <nav className="grid h-[64px] grid-cols-4 rounded-[10px] border bg-white shadow-lg">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className="flex flex-col items-center justify-center gap-0.5">
            {({ isActive }) => (
              <>
                <span className={`grid h-[34px] w-[40px] place-items-center rounded-[10px] ${isActive ? 'bg-primary text-white' : 'bg-primary-soft/50 text-navy'}`}>
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <span className={`text-[11px] ${isActive ? 'font-semibold text-primary' : 'text-navy'}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      </div>

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
