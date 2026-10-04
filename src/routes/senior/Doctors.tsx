import { Phone } from 'lucide-react'
import { useData } from '../../lib/data'
import SeniorShell, { SeniorEmpty } from '../../components/senior/SeniorShell'
import { usePhoneCall } from '../../components/PhoneCall'

export default function SeniorDoctors() {
  const call = usePhoneCall()
  const { snap } = useData()

  return (
    <SeniorShell title="Lekarze">
      {snap.doctors.length === 0 && <SeniorEmpty text="Nie ma jeszcze lekarzy." />}
      {snap.doctors.map((d) => (
        <article key={d.id} className="rounded-[10px] border-4 border-primary-soft p-5">
          <p className="text-2xl font-bold">{d.name}</p>
          {d.specialty && <p className="text-muted">{d.specialty}</p>}
          {d.clinic && <p className="mt-1 text-lg text-muted">{d.clinic}</p>}
          <button onClick={() => call({ name: d.name, number: d.phone })} className="mt-4 flex h-16 w-full items-center justify-center gap-2 rounded-[10px] bg-primary px-4 text-xl font-bold text-white">
            <Phone size={24} /> Zadzwoń i umów
          </button>
        </article>
      ))}
    </SeniorShell>
  )
}
