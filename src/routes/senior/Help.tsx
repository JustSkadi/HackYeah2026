import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../lib/data'
import { db } from '../../lib/db'
import { now } from '../../lib/clock'
import { firstName } from '../../lib/format'
import { StatusBar } from '../../components/ui'
import VideoCall from '../../components/VideoCall'

export default function SeniorHelp() {
  const { snap } = useData()
  const navigate = useNavigate()
  const sent = useRef(false)
  const caregiver = snap.senior?.caregiver_name ? firstName(snap.senior.caregiver_name) : 'Opiekun'

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
    <main className="mx-auto flex h-full max-w-md flex-col bg-navy text-[22px] text-white">
      <StatusBar dark />
      <VideoCall peerName={caregiver} onEnd={end} large />
    </main>
  )
}
