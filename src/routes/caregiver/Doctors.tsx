import { useState } from 'react'
import { MoreVertical, Pencil, Phone, Plus, Trash2, UserPlus } from 'lucide-react'
import { useData } from '../../lib/data'
import { db } from '../../lib/db'
import type { Doctor } from '../../lib/types'

export default function Doctors() {
  const { snap } = useData()
  const [adding, setAdding] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      {adding ? (
        <DoctorForm title="Nowy lekarz" onDone={() => setAdding(false)} />
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-white">
          <UserPlus size={18} /> Dodaj lekarza
        </button>
      )}
      {snap.doctors.length === 0 && (
        <p className="rounded-2xl bg-white p-6 text-center text-muted shadow-sm">Lekarze pojawią się po imporcie z IKP albo po dodaniu ręcznie.</p>
      )}
      {snap.doctors.map((d) => (
        <DoctorCard key={d.id} doctor={d} />
      ))}
    </div>
  )
}

/** Dokleja "dr", chyba że tytuł już jest (dr, dr hab., lek., prof.). */
function withTitle(name: string): string {
  const trimmed = name.trim()
  return /^(dr|lek|prof)\b/i.test(trimmed) ? trimmed : `dr ${trimmed}`
}

/** Formularz dodawania (bez `doctor`) albo edycji (z `doctor`). */
function DoctorForm({ title, doctor, onDone }: { title: string; doctor?: Doctor; onDone: () => void }) {
  const { snap } = useData()
  const [form, setForm] = useState({
    name: doctor?.name ?? '',
    specialty: doctor?.specialty ?? '',
    clinic: doctor?.clinic ?? '',
    phone: doctor?.phone ?? '',
  })
  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value })),
    className: 'rounded-lg border px-3 py-2',
  })

  const save = async () => {
    if (!snap.senior || !form.name || !form.phone) return
    await db.upsertDoctors([
      {
        id: doctor?.id ?? crypto.randomUUID(),
        senior_id: snap.senior.id,
        name: withTitle(form.name),
        specialty: form.specialty || null,
        clinic: form.clinic || null,
        phone: form.phone,
      },
    ])
    onDone()
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="font-bold">{title}</h2>
      <input placeholder="Imię i nazwisko, np. Jan Kowalski" {...field('name')} />
      <input placeholder="Specjalizacja, np. okulista" {...field('specialty')} />
      <input placeholder="Przychodnia i adres" {...field('clinic')} />
      <input type="tel" placeholder="Telefon do rejestracji" {...field('phone')} />
      <div className="grid grid-cols-2 gap-2">
        <button onClick={onDone} className="rounded-xl border py-2.5 font-semibold text-muted">
          Anuluj
        </button>
        <button onClick={save} disabled={!form.name || !form.phone} className="rounded-xl bg-success py-2.5 font-semibold text-white disabled:opacity-50">
          Zapisz
        </button>
      </div>
    </div>
  )
}

function DoctorCard({ doctor }: { doctor: Doctor }) {
  const { snap } = useData()
  const [mode, setMode] = useState<'view' | 'edit' | 'confirmDelete'>('view')
  const [menuOpen, setMenuOpen] = useState(false)
  const [visitOpen, setVisitOpen] = useState(false)
  const [when, setWhen] = useState('')
  const [note, setNote] = useState('')

  if (mode === 'edit') return <DoctorForm title="Edytuj lekarza" doctor={doctor} onDone={() => setMode('view')} />

  const saveVisit = async () => {
    if (!when || !snap.senior) return
    await db.addAppointment({
      senior_id: snap.senior.id,
      doctor_id: doctor.id,
      starts_at: new Date(when).toISOString(),
      place: doctor.clinic,
      note: note || null,
    })
    setVisitOpen(false)
    setWhen('')
    setNote('')
  }

  const pick = (next: 'edit' | 'confirmDelete') => {
    setMenuOpen(false)
    setMode(next)
  }

  return (
    <article className="relative rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="font-bold">{doctor.name}</h2>
          <p className="text-sm text-muted">{[doctor.specialty, doctor.clinic].filter(Boolean).join(' · ')}</p>
        </div>
        <button onClick={() => setMenuOpen((o) => !o)} aria-label="Więcej opcji" className="-mr-2 -mt-1 rounded-full p-1.5 text-muted hover:bg-slate-100">
          <MoreVertical size={20} />
        </button>
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-3 top-11 z-20 w-40 overflow-hidden rounded-xl border bg-white text-sm shadow-lg">
            <button onClick={() => pick('edit')} className="flex w-full items-center gap-2 px-3 py-2.5 hover:bg-slate-50">
              <Pencil size={16} /> Edytuj
            </button>
            <button onClick={() => pick('confirmDelete')} className="flex w-full items-center gap-2 px-3 py-2.5 text-danger hover:bg-danger-soft">
              <Trash2 size={16} /> Usuń
            </button>
          </div>
        </>
      )}

      {mode === 'confirmDelete' ? (
        <div className="mt-3 rounded-xl bg-danger-soft p-3 text-sm text-danger">
          <p className="font-semibold">Usunąć lekarza?</p>
          <p>Wizyty i leki zostaną, ale bez przypisanego lekarza.</p>
          <div className="mt-3 grid grid-cols-2 gap-2 font-semibold">
            <button onClick={() => setMode('view')} className="rounded-lg border border-danger bg-white py-2">
              Anuluj
            </button>
            <button onClick={() => db.deleteDoctor(doctor.id)} className="rounded-lg bg-danger py-2 text-white">
              Usuń
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm font-semibold">
            <a href={`tel:${doctor.phone}`} className="flex items-center justify-center gap-1 rounded-xl bg-primary py-2.5 text-white">
              <Phone size={16} /> Zadzwoń i umów
            </a>
            <button onClick={() => setVisitOpen((o) => !o)} className="flex items-center justify-center gap-1 rounded-xl border border-primary py-2.5 text-primary">
              <Plus size={16} /> Dodaj wizytę
            </button>
          </div>
          {visitOpen && (
            <div className="mt-3 flex flex-col gap-2">
              <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="rounded-lg border px-3 py-2" />
              <input placeholder="Notatka (opcjonalnie)" value={note} onChange={(e) => setNote(e.target.value)} className="rounded-lg border px-3 py-2" />
              <button onClick={saveVisit} disabled={!when} className="rounded-xl bg-success py-2.5 font-semibold text-white disabled:opacity-50">
                Zapisz w kalendarzu
              </button>
            </div>
          )}
        </>
      )}
    </article>
  )
}
