// Ekran wideorozmowy. Z VITE_DAILY_ROOM_URL - prawdziwa rozmowa (Daily.co w iframe).
// Bez niego - symulacja na demo: podgląd własnej kamery, "łączenie", licznik czasu.
import { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react'
import { config } from '../lib/config'

const CONNECT_AFTER_MS = 2500

interface Props {
  peerName: string
  onEnd: () => void
  large?: boolean // senior - większe przyciski i napisy
}

export default function VideoCall({ peerName, onEnd, large = false }: Props) {
  if (config.dailyRoomUrl) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <iframe src={config.dailyRoomUrl} allow="camera; microphone; fullscreen; display-capture" className="min-h-0 flex-1" title="Wideorozmowa" />
        <div className="p-4">
          <EndButton large={large} onEnd={onEnd} />
        </div>
      </div>
    )
  }
  return <SimulatedCall peerName={peerName} onEnd={onEnd} large={large} />
}

function SimulatedCall({ peerName, onEnd, large }: Required<Props>) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [camOn, setCamOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [hasCamera, setHasCamera] = useState(false)
  const [connectedAt, setConnectedAt] = useState<number | null>(null)
  const [, tick] = useState(0)

  // podgląd własnej kamery (jeśli przeglądarka pozwoli)
  useEffect(() => {
    let stream: MediaStream | null = null
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: false })
      .then((s) => {
        stream = s
        if (videoRef.current) videoRef.current.srcObject = s
        setHasCamera(true)
      })
      .catch(() => setHasCamera(false))
    return () => stream?.getTracks().forEach((t) => t.stop())
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setConnectedAt(Date.now()), CONNECT_AFTER_MS)
    const i = setInterval(() => tick((n) => n + 1), 1000)
    return () => {
      clearTimeout(t)
      clearInterval(i)
    }
  }, [])

  const secs = connectedAt ? Math.floor((Date.now() - connectedAt) / 1000) : 0
  const duration = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`
  const initials = peerName.slice(0, 1).toUpperCase()
  const btn = large ? 'h-16 w-16' : 'h-12 w-12'

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-navy text-white">
      {/* rozmówca */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="relative grid h-32 w-32 place-items-center rounded-full bg-primary text-6xl font-bold">
          {!connectedAt && <span className="absolute inset-0 animate-ping rounded-full bg-sky/40" />}
          {initials}
        </span>
        <p className={large ? 'text-4xl font-bold' : 'text-2xl font-bold'}>{peerName}</p>
        <p className={`${large ? 'text-2xl' : 'text-base'} text-primary-soft`}>{connectedAt ? `Połączono · ${duration}` : 'Łączenie…'}</p>
      </div>

      {/* własny podgląd */}
      <div className="absolute right-4 top-4 h-36 w-24 overflow-hidden rounded-[10px] border-2 border-white/30 bg-primary/60">
        <video ref={videoRef} autoPlay playsInline muted className={`h-full w-full scale-x-[-1] object-cover ${camOn && hasCamera ? '' : 'hidden'}`} />
        {!(camOn && hasCamera) && (
          <span className="grid h-full place-items-center">
            <VideoOff size={24} className="opacity-70" />
          </span>
        )}
      </div>

      <div className="flex items-center justify-center gap-5 p-6">
        <button onClick={() => setMicOn((v) => !v)} aria-label={micOn ? 'Wycisz' : 'Włącz mikrofon'} className={`${btn} grid place-items-center rounded-full ${micOn ? 'bg-white/15' : 'bg-white text-navy'}`}>
          {micOn ? <Mic /> : <MicOff />}
        </button>
        <button onClick={() => setCamOn((v) => !v)} aria-label={camOn ? 'Wyłącz kamerę' : 'Włącz kamerę'} className={`${btn} grid place-items-center rounded-full ${camOn ? 'bg-white/15' : 'bg-white text-navy'}`}>
          {camOn ? <Video /> : <VideoOff />}
        </button>
      </div>
      <div className="px-4 pb-4">
        <EndButton large={large} onEnd={onEnd} />
      </div>
    </div>
  )
}

function EndButton({ large, onEnd }: { large: boolean; onEnd: () => void }) {
  return (
    <button
      onClick={onEnd}
      className={`flex w-full items-center justify-center gap-3 rounded-[10px] bg-danger font-bold text-white ${large ? 'h-20 text-2xl' : 'h-14 text-lg'}`}
    >
      <PhoneOff size={large ? 30 : 22} /> Zakończ
    </button>
  )
}
