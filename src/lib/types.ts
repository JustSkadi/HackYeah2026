// Odpowiada tabelom z supabase/migrations/001_init.sql

export interface Senior {
  id: string
  name: string
  birth_date: string // YYYY-MM-DD
  sex: 'F' | 'M' | null
  caregiver_name: string | null
  caregiver_phone: string | null
}

export interface Doctor {
  id: string
  senior_id: string
  name: string
  specialty: string | null
  clinic: string | null
  phone: string
}

export interface Medication {
  id: string
  senior_id: string
  name: string
  active_substance: string | null
  dose_label: string
  units_per_dose: number
  times: string[] // ['08:00', '20:00']
  package_size: number
  packages_bought: number
  purchase_date: string // YYYY-MM-DD
  pharmacy: string | null
  prescribing_doctor_id: string | null
  free_65: boolean
  color: string | null
  image_url: string | null
  buy_online_url: string | null
  source: 'ikp' | 'manual'
}

export interface DoseEvent {
  id: string
  medication_id: string
  scheduled_at: string // ISO
  taken_at: string | null
}

export interface Appointment {
  id: string
  senior_id: string
  doctor_id: string | null
  starts_at: string
  place: string | null
  note: string | null
}

export interface HelpRequest {
  id: string
  senior_id: string
  created_at: string
  resolved_at: string | null
}

export interface DemoState {
  id: number
  time_offset_minutes: number
}
