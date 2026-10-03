import { addDays, format } from 'date-fns'
import { DEMO_SENIOR_ID } from '../lib/config'
import type { Appointment, Doctor, Medication, Senior } from '../lib/types'
import ikp from './ikp-mock.json'

export const seedSenior: Senior = {
  id: DEMO_SENIOR_ID,
  name: 'Halina Kowalska',
  birth_date: '1948-03-12',
  sex: 'F',
  caregiver_name: 'Anna (córka)',
  caregiver_phone: '+48500000009',
}

export function ikpDoctors(): Doctor[] {
  return ikp.doctors.map((d) => ({ ...d, senior_id: DEMO_SENIOR_ID }))
}

/** Leki "z IKP" z datą zakupu liczoną względem podanego dnia. */
export function ikpMedications(today: Date): Medication[] {
  return ikp.prescriptions.map((p) => ({
    id: p.id,
    senior_id: DEMO_SENIOR_ID,
    name: p.name,
    active_substance: p.active_substance,
    dose_label: p.dose_label,
    units_per_dose: p.units_per_dose,
    times: p.times,
    package_size: p.package_size,
    packages_bought: p.packages_bought,
    purchase_date: format(addDays(today, -p.purchase_days_ago), 'yyyy-MM-dd'),
    pharmacy: p.pharmacy,
    prescribing_doctor_id: p.doctor_id,
    free_65: p.free_65,
    color: p.color,
    image_url: null,
    buy_online_url: null,
    source: 'ikp',
  }))
}

export function seedAppointments(today: Date): Appointment[] {
  const at = addDays(today, 5)
  at.setHours(10, 30, 0, 0)
  return [
    {
      id: '00000000-0000-4000-8000-0000000000b1',
      senior_id: DEMO_SENIOR_ID,
      doctor_id: ikp.doctors[1].id,
      starts_at: at.toISOString(),
      place: ikp.doctors[1].clinic,
      note: 'Kontrola ciśnienia, zabrać wyniki',
    },
  ]
}
