// Wspólna rama podstron seniora: pasek statusu, duży "Wróć", tytuł, POMOC zawsze na dole.
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Phone } from 'lucide-react'
import { StatusBar } from '../ui'

export default function SeniorShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col bg-white pb-36 text-[22px] text-navy">
      <StatusBar />
      <div className="flex flex-col gap-4 px-5 pt-3">
        <Link to="/senior" className="-ml-1 flex items-center gap-1 self-start py-2 text-xl font-semibold text-primary">
          <ChevronLeft size={30} strokeWidth={2.5} /> Wróć
        </Link>
        <h1 className="text-[30px] font-bold leading-tight">{title}</h1>
        {children}
      </div>
      <PomocBar />
    </main>
  )
}

export function PomocBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md bg-linear-to-t from-white from-70% to-white/0 px-5 pb-4 pt-6">
      <Link
        to="/senior/pomoc"
        className="flex h-20 items-center justify-center gap-4 rounded-[10px] bg-danger text-4xl font-bold text-white shadow-xl active:scale-[0.98]"
      >
        <Phone size={36} /> POMOC
      </Link>
    </div>
  )
}

/** Komunikat, gdy brak danych z IKP (import robi opiekun). */
export function SeniorEmpty({ text }: { text: string }) {
  return <p className="rounded-[10px] bg-primary-soft/40 p-6 text-center text-muted">{text}</p>
}
