// "Sesja wolna" na /demo: losowe, ale realistyczne dane do samodzielnego eksplorowania.
// Zakłada czysty stan (po resetDemo).
import { addDays, addMinutes, format, parseISO } from 'date-fns'
import { db } from './db'
import { now, offsetForTimeToday, setClockOffset } from './clock'
import { scheduledTimesForDay } from './doses'
import { ikpDoctors, ikpMedications } from '../data/seed'
import { DEMO_SENIOR_ID } from './config'

const TAKEN_CHANCE = 0.65 // tyle minionych dawek senior "wziął"

const rnd = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))
const pad = (n: number) => String(n).padStart(2, '0')

/** Losuje godzinę, zapas leków, wzięte dawki i wizytę. Zwraca wylosowaną godzinę (HH:mm). */
export async function startRandomSession(): Promise<string> {
  const time = `${pad(rnd(7, 21))}:${pad(rnd(0, 59))}`
  const offset = offsetForTimeToday(time)
  setClockOffset(offset)
  await db.setDemoOffset(offset)
  const today = now()

  // leki z IKP z losową datą zakupu: od "świeżo kupione" do "kończy się dziś"
  const meds = ikpMedications(today).map((m) => {
    const supplyDays = Math.floor((m.package_size * m.packages_bought) / (m.units_per_dose * m.times.length))
    return { ...m, purchase_date: format(addDays(today, -rnd(1, supplyDays)), 'yyyy-MM-dd') }
  })
  const doctors = ikpDoctors()
  await db.upsertDoctors(doctors)
  await db.upsertMedications(meds)

  // dzisiejsze dawki - część z tych, które już minęły, jest potwierdzona
  await db.ensureDoses(meds.flatMap((m) => scheduledTimesForDay(m, today).map((iso) => ({ medication_id: m.id, scheduled_at: iso }))))
  const snap = await db.load()
  for (const d of snap.doses) {
    const at = parseISO(d.scheduled_at)
    if (at < today && Math.random() < TAKEN_CHANCE) await db.markTaken(d.id, addMinutes(at, rnd(0, 25)).toISOString())
  }

  // dodatkowa wizyta u losowego lekarza w najbliższych dniach
  const doctor = doctors[rnd(0, doctors.length - 1)]
  const visit = addDays(today, rnd(1, 12))
  visit.setHours(rnd(8, 16), [0, 15, 30, 45][rnd(0, 3)], 0, 0)
  await db.addAppointment({ senior_id: DEMO_SENIOR_ID, doctor_id: doctor.id, starts_at: visit.toISOString(), place: doctor.clinic, note: null })

  return time
}
