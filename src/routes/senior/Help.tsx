import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PhoneOff } from 'lucide-react'
import { useData } from '../../lib/data'
import { db } from '../../lib/db'
import { now } from '../../lib/clock'
import { firstName } from '../../lib/format'
import { StatusBar } from '../../components/ui'
import { DEMO_VIDEO } from '../../lib/config'
import VideoCall from '../../components/VideoCall'

const ENDED_SCREEN_MS = 1500

export default function SeniorHelp() {
  const { snap } = useData()
  const navigate = useNavigate()
  const sent = useRef(false)
  const opened = useRef(false) // czy prośba o pomoc już jest w bazie
  const [endedRemotely, setEndedRemotely] = useState(false)
  const caregiver = snap.senior?.caregiver_name ? firstName(snap.senior.caregiver_name) : 'Opiekun'
  const open = snap.helpRequests.length > 0

  useEffect(() => {
    if (sent.current) return
    sent.current = true
    db.createHelpRequest(now().toISOString())
  }, [])

  // opiekun zakończył rozmowę (albo zamknął alert) -> kończymy też u seniora
  useEffect(() => {
    if (open) opened.current = true
    else if (opened.current && !endedRemotely) {
      setEndedRemotely(true)
      setTimeout(() => navigate('/senior'), ENDED_SCREEN_MS)
    }
  }, [open, endedRemotely, navigate])

  const end = async () => {
    await db.resolveHelpRequests(now().toISOString())
    navigate('/senior')
  }

  return (
    <main className="mx-auto flex h-full max-w-md flex-col bg-navy text-[22px] text-white">
      <StatusBar dark />
      {endedRemotely ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <PhoneOff size={56} className="text-primary-soft" />
          <p className="text-3xl font-bold">Rozmowa zakończona</p>
        </div>
      ) : (
        <VideoCall peerName={caregiver} peerVideo={DEMO_VIDEO.caregiver} onEnd={end} large />
      )}
    </main>
  )
}
