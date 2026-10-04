import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { differenceInYears, isSameDay, parseISO } from 'date-fns'
import { db, type Snapshot } from './db'
import { now, setClockOffset } from './clock'
import { config } from './config'
import { doseStatus, isDoseApplicable, scheduledTimesForDay, type DoseStatus } from './doses'
import type { DoseEvent, Medication } from './types'

export interface TodayDose {
  dose: DoseEvent
  med: Medication
  status: DoseStatus
}

interface Data {
  snap: Snapshot
  current: Date
  age: number | null
  todayDoses: TodayDose[]
  missed: TodayDose[]
}

const Ctx = createContext<Data | null>(null)

const sameInstant = (a: string, b: string) => parseISO(a).getTime() === parseISO(b).getTime()

export function DataProvider({ children }: { children: ReactNode }) {
  const [snap, setSnap] = useState<Snapshot | null>(null)
  const [current, setCurrent] = useState(now())
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      const s = await db.load()
      setClockOffset(s.demoOffset)
      setSnap(s)
      setCurrent(now())
    } catch (e) {
      setError(e instanceof Error ? e.message : JSON.stringify(e))
    }
  }, [])

  useEffect(() => {
    reload()
    return db.subscribe(reload)
  }, [reload])

  useEffect(() => {
    const t = setInterval(() => setCurrent(now()), 10_000)
    return () => clearInterval(t)
  }, [])

  // Dopilnuj, żeby dzisiejsze dawki istniały w bazie
  const dayKey = current.toDateString()
  useEffect(() => {
    if (!snap) return
    const missing = snap.medications.flatMap((med) =>
      scheduledTimesForDay(med, current)
        .filter((iso) => isDoseApplicable(med, iso, current))
        .filter((iso) => !snap.doses.some((d) => d.medication_id === med.id && sameInstant(d.scheduled_at, iso)))
        .map((iso) => ({ medication_id: med.id, scheduled_at: iso })),
    )
    if (missing.length) db.ensureDoses(missing).catch((e) => setError(String(e?.message ?? e)))
  }, [snap, dayKey])

  const value = useMemo<Data | null>(() => {
    if (!snap) return null
    const todayDoses = snap.doses
      .filter((d) => isSameDay(parseISO(d.scheduled_at), current))
      .flatMap((dose) => {
        const med = snap.medications.find((m) => m.id === dose.medication_id)
        return med ? [{ dose, med, status: doseStatus(dose, current, config.graceMinutes) }] : []
      })
      .sort((a, b) => parseISO(a.dose.scheduled_at).getTime() - parseISO(b.dose.scheduled_at).getTime())
    return {
      snap,
      current,
      age: snap.senior ? differenceInYears(current, parseISO(snap.senior.birth_date)) : null,
      todayDoses,
      missed: todayDoses.filter((t) => t.status === 'missed'),
    }
  }, [snap, current])

  if (error) {
    return (
      <div className="p-6 text-danger">
        <p className="font-bold">Błąd połączenia z bazą ({db.mode})</p>
        <pre className="mt-2 text-sm whitespace-pre-wrap">{error}</pre>
      </div>
    )
  }
  if (!value) return <div className="grid h-full place-items-center text-muted">Ładowanie…</div>
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useData(): Data {
  const v = useContext(Ctx)
  if (!v) throw new Error('useData poza DataProvider')
  return v
}
