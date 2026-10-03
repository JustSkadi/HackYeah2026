import { useNavigate } from 'react-router-dom'
import MedicationForm from '../../components/MedicationForm'
import { StatusBar } from '../../components/ui'

export default function SeniorAddMedication() {
  const navigate = useNavigate()
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col bg-white pb-8 text-[22px]">
      <StatusBar />
      <div className="flex flex-col gap-6 px-5 pt-4">
        <h1 className="text-[28px] font-bold text-navy">Dodaj lek</h1>
        <MedicationForm large onDone={() => navigate('/senior')} />
      </div>
    </main>
  )
}
