// Wspólne elementy układu z Figmy: logo, nagłówek sekcji, kafelki skrótów.
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, FolderOpen, Microscope, Stethoscope, type LucideIcon } from 'lucide-react'

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
  { label: 'Skierowania', icon: ClipboardList },
  { label: 'Badania', icon: Microscope },
  { label: 'Lekarze', icon: Stethoscope, to: '/opiekun/lekarze' },
  { label: 'Dokumenty', icon: FolderOpen },
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
