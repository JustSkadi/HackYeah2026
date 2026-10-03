// Wspólne elementy układu z Figmy: logo, nagłówek sekcji, kafelki skrótów.
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BatteryFull, ChevronLeft, ClipboardList, FolderOpen, Microscope, Signal, Stethoscope, Wifi, type LucideIcon } from 'lucide-react'
import { useData } from '../lib/data'
import ImportOrAdd from './caregiver/ImportOrAdd'
import { fmtTime } from '../lib/format'

/** Symulowany pasek statusu telefonu. Godzina z zegara demo, więc widać przesunięcie czasu. */
export function StatusBar({ dark = false }: { dark?: boolean }) {
  const { current } = useData()
  return (
    <div
      className={`sticky top-0 z-30 flex h-8 w-full shrink-0 items-center justify-between self-stretch px-6 text-[13px] font-semibold ${dark ? 'bg-navy text-white' : 'bg-white text-navy'}`}
    >
      <span className="tabular-nums">{fmtTime(current)}</span>
      <span className="flex items-center gap-1.5">
        <Signal size={15} strokeWidth={2.25} />
        <Wifi size={15} strokeWidth={2.25} />
        <BatteryFull size={20} strokeWidth={2} />
      </span>
    </div>
  )
}

/** Tytuł podstrony z przyciskiem wstecz (Lekarze, Skierowania, Badania, Dokumenty). */
export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => navigate(-1)} aria-label="Wstecz" className="-ml-2 rounded-full p-1.5 text-navy hover:bg-primary-soft/40">
        <ChevronLeft size={24} />
      </button>
      <div>
        <h1 className="text-xl font-semibold text-navy">{title}</h1>
        {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
      </div>
    </div>
  )
}

/** Dane z IKP pokazujemy dopiero po imporcie - inaczej zachęta do importu. */
export function NeedsIkpImport({ children }: { children: ReactNode }) {
  const { snap } = useData()
  if (snap.medications.length > 0) return <>{children}</>
  return <ImportOrAdd title="Brak danych z IKP" text="Zaimportuj dane z Internetowego Konta Pacjenta albo dodaj lek ręcznie." />
}

/** Logo z Figmy (Marck Script). Rozmiar przez className, domyślnie 28px. */
export function Logo({ className = 'text-[28px]' }: { className?: string }) {
  return <span className={`font-logo leading-none text-navy ${className}`}>MySenior</span>
}

interface SectionProps {
  title: string
  /** link "Zobacz wszystkie" - ścieżka albo akcja */
  more?: { to: string } | { onClick: () => void; label?: string }
  children: ReactNode
}

export function Section({ title, more, children }: SectionProps) {
  const moreCls = 'text-xs italic font-medium text-accent hover:underline'
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-[17px] font-semibold text-navy">{title}</h2>
        {more &&
          ('to' in more ? (
            <Link to={more.to} className={moreCls}>
              Zobacz wszystkie
            </Link>
          ) : (
            <button onClick={more.onClick} className={moreCls}>
              {more.label ?? 'Zobacz wszystkie'}
            </button>
          ))}
      </div>
      {children}
    </section>
  )
}

interface Tile {
  label: string
  icon: LucideIcon
  to?: string // brak = funkcja "wkrótce"
}

const TILES: Tile[] = [
  { label: 'Skierowania', icon: ClipboardList, to: '/opiekun/skierowania' },
  { label: 'Badania', icon: Microscope, to: '/opiekun/badania' },
  { label: 'Lekarze', icon: Stethoscope, to: '/opiekun/lekarze' },
  { label: 'Dokumenty', icon: FolderOpen, to: '/opiekun/dokumenty' },
]

/** Rząd 4 kafelków skrótów (styl IKP). Niedostępne funkcje są oznaczone "wkrótce". */
export function QuickTiles() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {TILES.map(({ label, icon: Icon, to }) => {
        const body = (
          <>
            <span className={`grid h-[58px] w-full place-items-center rounded-[10px] ${to ? 'bg-primary-soft/60 text-primary' : 'bg-primary-soft/25 text-primary/40'}`}>
              <Icon size={24} strokeWidth={1.75} />
            </span>
            <span className={`text-[11px] leading-tight ${to ? 'text-navy' : 'text-muted'}`}>{label}</span>
            {!to && <span className="-mt-1 text-[9px] uppercase tracking-wide text-muted">wkrótce</span>}
          </>
        )
        return to ? (
          <Link key={label} to={to} className="flex flex-col items-center gap-1.5 text-center">
            {body}
          </Link>
        ) : (
          <div key={label} aria-disabled className="flex flex-col items-center gap-1.5 text-center">
            {body}
          </div>
        )
      })}
    </div>
  )
}
