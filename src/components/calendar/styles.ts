import type { CalEvent } from './events'

/** Klasy kolorów wydarzenia (tło + pasek z lewej + tekst). */
export function eventClasses(e: CalEvent): string {
  switch (e.kind) {
    case 'appointment':
      return 'bg-primary text-white border-primary'
    case 'refill':
      return e.overdue ? 'bg-danger-soft text-danger border-danger' : 'bg-warning-soft text-warning border-warning'
    case 'runout':
      return 'bg-slate-100 text-muted border-slate-400'
    case 'doses':
      return {
        taken: 'bg-success-soft text-success border-success',
        missed: 'bg-danger-soft text-danger border-danger',
        due: 'bg-primary-soft text-primary border-primary',
        upcoming: 'bg-white text-ink border-slate-300',
        planned: 'bg-white text-ink border-slate-300',
      }[e.status]
  }
}

export const doseStatusLabel = {
  taken: 'Wzięte',
  missed: 'Brak potwierdzenia',
  due: 'Teraz',
  upcoming: 'Zaplanowane',
  planned: 'Zaplanowane',
} as const
