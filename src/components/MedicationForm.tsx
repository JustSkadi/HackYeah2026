// Ręczne dodawanie leku - wspólne dla seniora (large) i opiekuna.
// Zamiast wpisywania godzin i dawek - duże przyciski do wyboru (prościej dla seniora).
import { useState } from 'react'
import { format } from 'date-fns'
import { Check } from 'lucide-react'
import { useData } from '../lib/data'
import { db } from '../lib/db'
import { now } from '../lib/clock'

const TIMES = [
  { label: 'Rano', time: '08:00' },
  { label: 'Południe', time: '13:00' },
  { label: 'Wieczór', time: '20:00' },
  { label: 'Noc', time: '22:00' },
]
const DOSES = [
  { label: '½ tabletki', units: 0.5 },
  { label: '1 tabletka', units: 1 },
  { label: '2 tabletki', units: 2 },
]
const PACKAGES = [28, 30, 60]
const COLORS = ['#ffffff', '#fde68a', '#fca5a5', '#c4e2f5', '#bbf7d0', '#e9d5ff']

interface Props {
  large?: boolean
  onDone: () => void
}

export default function MedicationForm({ large = false, onDone }: Props) {
  const { snap } = useData()
  const [name, setName] = useState('')
  const [times, setTimes] = useState<string[]>(['08:00'])
  const [dose, setDose] = useState(DOSES[1])
  const [pkg, setPkg] = useState(30)
  const [color, setColor] = useState(COLORS[0])

  const canSave = name.trim() !== '' && times.length > 0 && !!snap.senior
  const toggleTime = (t: string) => setTimes((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t].sort()))

  const save = async () => {
    if (!canSave || !snap.senior) return
    await db.upsertMedications([
      {
        id: crypto.randomUUID(),
        senior_id: snap.senior.id,
        name: name.trim(),
        active_substance: null,
        dose_label: dose.label,
        units_per_dose: dose.units,
        times,
        package_size: pkg,
        packages_bought: 1,
        purchase_date: format(now(), 'yyyy-MM-dd'),
        pharmacy: null,
        prescribing_doctor_id: null,
        free_65: false,
        color,
        image_url: null,
        buy_online_url: null,
        source: 'manual',
      },
    ])
    onDone()
  }

  // rozmiary: senior - duże pola i przyciski (min. 64px), opiekun - standardowe
  const s = large
    ? { label: 'text-xl font-semibold', input: 'h-16 px-4 text-2xl', chip: 'min-h-16 px-3 text-xl', swatch: 'h-14 w-14', button: 'h-20 text-2xl', gap: 'gap-5' }
    : { label: 'text-sm font-semibold', input: 'h-11 px-3', chip: 'min-h-10 px-3 text-sm', swatch: 'h-9 w-9', button: 'h-12', gap: 'gap-4' }
  const chip = (active: boolean) =>
    `${s.chip} rounded-[10px] border-2 font-semibold ${active ? 'border-primary bg-primary text-white' : 'border-primary-soft bg-white text-navy'}`

  return (
    <div className={`flex flex-col ${s.gap}`}>
      <label className="flex flex-col gap-2">
        <span className={s.label}>Nazwa leku</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="np. Polpril 5" className={`${s.input} rounded-[10px] border-2 border-primary-soft`} />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className={`${s.label} mb-2`}>Kiedy brać?</legend>
        <div className="grid grid-cols-2 gap-2">
          {TIMES.map(({ label, time }) => (
            <button key={time} type="button" onClick={() => toggleTime(time)} className={chip(times.includes(time))}>
              {label} <span className="font-normal opacity-80">{time}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className={`${s.label} mb-2`}>Ile na raz?</legend>
        <div className="grid grid-cols-3 gap-2">
          {DOSES.map((d) => (
            <button key={d.label} type="button" onClick={() => setDose(d)} className={chip(dose.label === d.label)}>
              {d.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className={`${s.label} mb-2`}>Ile tabletek w opakowaniu?</legend>
        <div className="grid grid-cols-3 gap-2">
          {PACKAGES.map((p) => (
            <button key={p} type="button" onClick={() => setPkg(p)} className={chip(pkg === p)}>
              {p}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className={`${s.label} mb-2`}>Kolor tabletki</legend>
        <div className="flex flex-wrap gap-3">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Kolor ${c}`}
              className={`${s.swatch} grid place-items-center rounded-full border-2 ${color === c ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-navy/20'}`}
              style={{ background: c }}
            >
              {color === c && <Check className="text-navy" />}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={onDone} className={`${s.button} rounded-[10px] border-2 border-primary-soft font-semibold text-muted`}>
          Anuluj
        </button>
        <button type="button" onClick={save} disabled={!canSave} className={`${s.button} rounded-[10px] bg-success font-bold text-white disabled:opacity-40`}>
          Zapisz
        </button>
      </div>
    </div>
  )
}
