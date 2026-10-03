import { useState } from 'react'
import { Phone, Plus } from 'lucide-react'
import { useData } from '../../lib/data'
import { db } from '../../lib/db'
import type { Doctor } from '../../lib/types'

export default function Doctors() {
  const { snap } = useData()

  if (snap.doctors.length === 0) {
    return <p className="rounded-2xl bg-white p-6 text-center text-muted shadow-sm">Lekarze pojawią się po imporcie z IKP.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {snap.doctors.map((d) => (
        <DoctorCard key={d.id} doctor={d} />
      ))}
    </div>
  )
}

function DoctorCard({ doctor }: { doctor: Doctor }) {
  const { snap } = useData()
  const [open, setOpen] = useState(false)
  const [when, setWhen] = useState('')
  const [note, setNote] = useState('')

  const save = async () => {
    if (!when || !snap.senior) return
    await db.addAppointment({
      senior_id: snap.senior.id,
      doctor_id: doctor.id,
      starts_at: new Date(when).toISOString(),
      place: doctor.clinic,
      note: note || null,
    })
    setOpen(false)
    setWhen('')
    setNote('')
  }

  return (
    <article className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="font-bold">{doctor.name}</h2>
      <p className="text-sm text-muted">
        {doctor.specialty} · {doctor.clinic}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm font-semibold">
        <a href={`tel:${doctor.phone}`} className="flex items-center justify-center gap-1 rounded-xl bg-primary py-2.5 text-white">
          <Phone size={16} /> Zadzwoń i umów
        </a>
        <button onClick={() => setOpen((o) => !o)} className="flex items-center justify-center gap-1 rounded-xl border border-primary py-2.5 text-primary">
          <Plus size={16} /> Dodaj wizytę
        </button>
      </div>
      {open && (
        <div className="mt-3 flex flex-col gap-2">
          <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="rounded-lg border px-3 py-2" />
          <input placeholder="Notatka (opcjonalnie)" value={note} onChange={(e) => setNote(e.target.value)} className="rounded-lg border px-3 py-2" />
          <button onClick={save} disabled={!when} className="rounded-xl bg-success py-2.5 font-semibold text-white disabled:opacity-50">
            Zapisz w kalendarzu
          </button>
        </div>
      )}
    </article>
  )
}
