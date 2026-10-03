import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, X } from 'lucide-react'
import { useData } from '../../lib/data'
import { db } from '../../lib/db'
import { now } from '../../lib/clock'
import { config } from '../../lib/config'
import { firstName } from '../../lib/format'

export default function SeniorHelp() {
  const { snap } = useData()
  const navigate = useNavigate()
  const sent = useRef(false)
  const caregiver = snap.senior?.caregiver_name ? firstName(snap.senior.caregiver_name) : 'opiekunem'

  useEffect(() => {
    if (sent.current) return
    sent.current = true
    db.createHelpRequest(now().toISOString())
  }, [])

  const end = async () => {
    await db.resolveHelpRequests(now().toISOString())
    navigate('/senior')
  }

  return (
    <main className="mx-auto flex h-full max-w-md flex-col bg-ink text-[22px] text-white">
      {config.dailyRoomUrl ? (
        <iframe src={config.dailyRoomUrl} allow="camera; microphone; fullscreen; display-capture" className="min-h-0 flex-1" title="Wideorozmowa" />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
          <span className="h-24 w-24 animate-ping rounded-full bg-danger/60" />
          <p className="text-4xl font-bold">Łączę z: {caregiver}</p>
          <p className="text-white/70">Wideorozmowa (ustaw VITE_DAILY_ROOM_URL)</p>
        </div>
      )}
      <div className="grid gap-3 p-4">
        {snap.senior?.caregiver_phone && (
          <a href={`tel:${snap.senior.caregiver_phone}`} className="flex h-20 items-center justify-center gap-3 rounded-2xl bg-white text-2xl font-bold text-ink">
            <Phone size={32} /> Zadzwoń zwykłym telefonem
          </a>
        )}
        <button onClick={end} className="flex h-20 items-center justify-center gap-3 rounded-2xl bg-danger text-2xl font-bold">
          <X size={32} /> Zakończ
        </button>
      </div>
    </main>
  )
}
