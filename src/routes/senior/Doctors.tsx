import { Phone } from 'lucide-react'
import { useData } from '../../lib/data'
import SeniorShell, { SeniorEmpty } from '../../components/senior/SeniorShell'
import { usePhoneCall } from '../../components/PhoneCall'

export default function SeniorDoctors() {
  const call = usePhoneCall()
  const { snap } = useData()

  return (
    <SeniorShell title="Moi lekarze">
      {snap.doctors.length === 0 && <SeniorEmpty text="Nie ma jeszcze lekarzy." />}
      {snap.doctors.map((d) => (
        <article key={d.id} className="rounded-[10px] border-4 border-primary-soft p-5">
          <p className="text-2xl font-bold">{d.name}</p>
          {d.specialty && <p className="text-muted">{d.specialty}</p>}
          {d.clinic && <p className="mt-1 text-lg text-muted">{d.clinic}</p>}
          <button onClick={() => call({ name: d.name, number: d.phone })} className="mt-4 flex h-16 items-center justify-center gap-3 rounded-[10px] bg-primary text-2xl font-bold text-white">
            <Phone size={28} /> Zadzwoń
          </button>
        </article>
      ))}
    </SeniorShell>
  )
}
