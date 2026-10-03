import { Link } from 'react-router-dom'
import { HeartHandshake, MonitorSmartphone, UserRound } from 'lucide-react'

export default function RoleSelect() {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">MójSenior</h1>
        <p className="mt-2 text-lg text-muted">Leki, recepty i wizyty seniora pod kontrolą opiekuna.</p>
      </div>
      <Link to="/senior" className="flex items-center gap-4 rounded-3xl bg-primary p-6 text-2xl font-bold text-white shadow-lg">
        <UserRound size={40} /> Jestem seniorem
      </Link>
      <Link to="/opiekun" className="flex items-center gap-4 rounded-3xl border-2 border-primary bg-white p-6 text-2xl font-bold text-primary shadow">
        <HeartHandshake size={40} /> Jestem opiekunem
      </Link>
      <Link to="/demo" className="mt-4 flex items-center justify-center gap-2 text-muted underline">
        <MonitorSmartphone size={18} /> Tryb demo: oba ekrany obok siebie
      </Link>
    </main>
  )
}
