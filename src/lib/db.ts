// Warstwa danych. Dwie implementacje z tym samym API:
// - supabase: gdy ustawione VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY (demo na dwóch telefonach)
// - local: localStorage + BroadcastChannel (praca bez konfiguracji; synchronizacja między kartami/iframe'ami)
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { config, DEMO_SENIOR_ID } from './config'
import type { Appointment, Doctor, DoseEvent, HelpRequest, Medication, Senior } from './types'
import { ikpDoctors, seedAppointments, seedSenior } from '../data/seed'

export interface Snapshot {
  senior: Senior | null
  doctors: Doctor[]
  medications: Medication[]
  doses: DoseEvent[]
  appointments: Appointment[]
  helpRequests: HelpRequest[] // tylko otwarte
  demoOffset: number
}

export interface Db {
  mode: 'local' | 'supabase'
  load(): Promise<Snapshot>
  subscribe(onChange: () => void): () => void
  upsertDoctors(doctors: Doctor[]): Promise<void>
  /** Leki i wizyty zostają, tylko tracą powiązanie z lekarzem (jak "on delete set null" w SQL). */
  deleteDoctor(id: string): Promise<void>
  upsertMedications(meds: Medication[]): Promise<void>
  ensureDoses(rows: Pick<DoseEvent, 'medication_id' | 'scheduled_at'>[]): Promise<void>
  markTaken(doseId: string, atIso: string): Promise<void>
  addAppointment(a: Omit<Appointment, 'id'>): Promise<void>
  createHelpRequest(atIso: string): Promise<void>
  resolveHelpRequests(atIso: string): Promise<void>
  setDemoOffset(minutes: number): Promise<void>
  resetDemo(today: Date): Promise<void>
}

// ---------------------------------------------------------------- local

const STORAGE_KEY = 'mojsenior:v1'
const CHANNEL = 'mojsenior'

function seedSnapshot(today: Date): Snapshot {
  return {
    senior: seedSenior,
    doctors: ikpDoctors(),
    medications: [],
    doses: [],
    appointments: seedAppointments(today),
    helpRequests: [],
    demoOffset: 0,
  }
}

function createLocalDb(): Db {
  const listeners = new Set<() => void>()
  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL) : null
  channel?.addEventListener('message', () => listeners.forEach((l) => l()))

  const read = (): Snapshot => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw) as Snapshot
    } catch {
      // brak dostępu do localStorage - lecimy na seedzie
    }
    return seedSnapshot(new Date())
  }

  const write = (mutate: (s: Snapshot) => void) => {
    const s = read()
    mutate(s)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    } catch {
      // ignorujemy - demo dalej działa w tej karcie do odświeżenia
    }
    channel?.postMessage('changed')
    listeners.forEach((l) => l())
  }

  const upsertById = <T extends { id: string }>(list: T[], items: T[]) => {
    for (const item of items) {
      const i = list.findIndex((x) => x.id === item.id)
      if (i >= 0) list[i] = item
      else list.push(item)
    }
  }

  return {
    mode: 'local',
    async load() {
      const s = read()
      return { ...s, helpRequests: s.helpRequests.filter((h) => !h.resolved_at) }
    },
    subscribe(onChange) {
      listeners.add(onChange)
      return () => listeners.delete(onChange)
    },
    async upsertDoctors(doctors) {
      write((s) => upsertById(s.doctors, doctors))
    },
    async deleteDoctor(id) {
      write((s) => {
        s.doctors = s.doctors.filter((d) => d.id !== id)
        s.medications.forEach((m) => m.prescribing_doctor_id === id && (m.prescribing_doctor_id = null))
        s.appointments.forEach((a) => a.doctor_id === id && (a.doctor_id = null))
      })
    },
    async upsertMedications(meds) {
      write((s) => upsertById(s.medications, meds))
    },
    async ensureDoses(rows) {
      write((s) => {
        for (const r of rows) {
          const exists = s.doses.some((d) => d.medication_id === r.medication_id && d.scheduled_at === r.scheduled_at)
          if (!exists) s.doses.push({ id: crypto.randomUUID(), taken_at: null, ...r })
        }
      })
    },
    async markTaken(doseId, atIso) {
      write((s) => {
        const d = s.doses.find((x) => x.id === doseId)
        if (d) d.taken_at = atIso
      })
    },
    async addAppointment(a) {
      write((s) => s.appointments.push({ id: crypto.randomUUID(), ...a }))
    },
    async createHelpRequest(atIso) {
      write((s) => s.helpRequests.push({ id: crypto.randomUUID(), senior_id: DEMO_SENIOR_ID, created_at: atIso, resolved_at: null }))
    },
    async resolveHelpRequests(atIso) {
      write((s) => s.helpRequests.forEach((h) => (h.resolved_at ??= atIso)))
    },
    async setDemoOffset(minutes) {
      write((s) => (s.demoOffset = minutes))
    },
    async resetDemo(today) {
      write((s) => Object.assign(s, seedSnapshot(today)))
    },
  }
}

// ------------------------------------------------------------- supabase

function createSupabaseDb(sb: SupabaseClient): Db {
  const check = <T,>(res: { data: T; error: unknown }): T => {
    if (res.error) throw res.error
    return res.data
  }

  return {
    mode: 'supabase',
    async load() {
      const [senior, doctors, medications, doses, appointments, help, demo] = await Promise.all([
        sb.from('seniors').select('*').eq('id', DEMO_SENIOR_ID).maybeSingle(),
        sb.from('doctors').select('*').eq('senior_id', DEMO_SENIOR_ID),
        sb.from('medications').select('*').eq('senior_id', DEMO_SENIOR_ID),
        sb.from('dose_events').select('*'),
        sb.from('appointments').select('*').eq('senior_id', DEMO_SENIOR_ID),
        sb.from('help_requests').select('*').eq('senior_id', DEMO_SENIOR_ID).is('resolved_at', null),
        sb.from('demo_state').select('*').eq('id', 1).maybeSingle(),
      ])
      return {
        senior: check(senior) as Senior | null,
        doctors: check(doctors) as Doctor[],
        medications: (check(medications) as Medication[]).map((m) => ({ ...m, units_per_dose: Number(m.units_per_dose) })),
        doses: check(doses) as DoseEvent[],
        appointments: check(appointments) as Appointment[],
        helpRequests: check(help) as HelpRequest[],
        demoOffset: (check(demo) as { time_offset_minutes: number } | null)?.time_offset_minutes ?? 0,
      }
    },
    subscribe(onChange) {
      const channel = sb
        .channel('mojsenior-changes')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => onChange())
        .subscribe()
      return () => {
        sb.removeChannel(channel)
      }
    },
    async upsertDoctors(doctors) {
      check(await sb.from('doctors').upsert(doctors))
    },
    async deleteDoctor(id) {
      check(await sb.from('doctors').delete().eq('id', id))
    },
    async upsertMedications(meds) {
      check(await sb.from('medications').upsert(meds))
    },
    async ensureDoses(rows) {
      check(await sb.from('dose_events').upsert(rows, { onConflict: 'medication_id,scheduled_at', ignoreDuplicates: true }))
    },
    async markTaken(doseId, atIso) {
      check(await sb.from('dose_events').update({ taken_at: atIso }).eq('id', doseId))
    },
    async addAppointment(a) {
      check(await sb.from('appointments').insert(a))
    },
    async createHelpRequest(atIso) {
      check(await sb.from('help_requests').insert({ senior_id: DEMO_SENIOR_ID, created_at: atIso }))
    },
    async resolveHelpRequests(atIso) {
      check(await sb.from('help_requests').update({ resolved_at: atIso }).is('resolved_at', null))
    },
    async setDemoOffset(minutes) {
      check(await sb.from('demo_state').upsert({ id: 1, time_offset_minutes: minutes }))
    },
    async resetDemo(today) {
      // kolejność ze względu na klucze obce
      check(await sb.from('help_requests').delete().eq('senior_id', DEMO_SENIOR_ID))
      check(await sb.from('appointments').delete().eq('senior_id', DEMO_SENIOR_ID))
      check(await sb.from('medications').delete().eq('senior_id', DEMO_SENIOR_ID)) // dose_events kaskadowo
      check(await sb.from('seniors').upsert(seedSenior))
      check(await sb.from('doctors').upsert(ikpDoctors()))
      check(await sb.from('appointments').insert(seedAppointments(today)))
      check(await sb.from('demo_state').upsert({ id: 1, time_offset_minutes: 0 }))
    },
  }
}

export const db: Db =
  config.supabaseUrl && config.supabaseAnonKey
    ? createSupabaseDb(createClient(config.supabaseUrl, config.supabaseAnonKey))
    : createLocalDb()
