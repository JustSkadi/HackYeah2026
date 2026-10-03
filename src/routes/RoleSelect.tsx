import { Link } from 'react-router-dom'
import { Logo } from '../components/ui'
import { HeartHandshake, MonitorSmartphone, UserRound } from 'lucide-react'

export default function RoleSelect() {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-6 p-6">
      <div className="text-center">
        <Logo className="text-5xl" />
        <p className="mt-2 text-lg text-muted">Leki, recepty i wizyty seniora pod kontrolą opiekuna.</p>
      </div>
      <Link to="/demo" className="flex items-center gap-4 rounded-3xl bg-success p-6 text-2xl font-bold text-white shadow-lg">
        <MonitorSmartphone size={40} /> Tryb demo
      </Link>
      <Link to="/senior" className="flex items-center gap-4 rounded-3xl bg-primary p-6 text-2xl font-bold text-white shadow-lg">
        <UserRound size={40} /> Jestem seniorem
      </Link>
      <Link to="/opiekun" className="flex items-center gap-4 rounded-3xl border-2 border-primary bg-white p-6 text-2xl font-bold text-primary shadow">
        <HeartHandshake size={40} /> Jestem opiekunem
      </Link>
    </main>
  )
}
