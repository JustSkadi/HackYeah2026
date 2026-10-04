// Symulowane połączenie telefoniczne (zamiast prawdziwego tel: - na demo nikt nie dzwoni naprawdę).
// Użycie: const call = usePhoneCall(); call({ name: 'dr Anna Nowak', number: '+48...' })
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Mic, MicOff, PhoneOff, Volume2 } from 'lucide-react'
import { StatusBar } from './ui'

interface Callee {
  name: string
  number: string
}

const CallCtx = createContext<(c: Callee) => void>(() => {})

export const usePhoneCall = () => useContext(CallCtx)

const CONNECT_AFTER_MS = 3000

export function PhoneCallProvider({ children }: { children: ReactNode }) {
  const [callee, setCallee] = useState<Callee | null>(null)
  const large = useLocation().pathname.startsWith('/senior') // u seniora większe napisy i przyciski

  return (
    <CallCtx.Provider value={setCallee}>
      {children}
      {callee && <CallScreen callee={callee} large={large} onEnd={() => setCallee(null)} />}
    </CallCtx.Provider>
  )
}

function CallScreen({ callee, large, onEnd }: { callee: Callee; large: boolean; onEnd: () => void }) {
  const [connectedAt, setConnectedAt] = useState<number | null>(null)
  const [muted, setMuted] = useState(false)
  const [speaker, setSpeaker] = useState(false)
  const [, tick] = useState(0)

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
  const initial = callee.name.replace(/^(dr|lek\.|prof\.)\s+/i, '').slice(0, 1).toUpperCase()
  const btn = large ? 'h-20 w-20' : 'h-16 w-16'
  const toggle = (on: boolean) => `${btn} grid place-items-center rounded-full ${on ? 'bg-white text-navy' : 'bg-white/15'}`

  return (
    <div className="fixed inset-0 z-[60] mx-auto flex max-w-md flex-col bg-navy text-white">
      <StatusBar dark />
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <span className="relative mb-3 grid h-32 w-32 place-items-center rounded-full bg-primary text-6xl font-bold">
          {!connectedAt && <span className="absolute inset-0 animate-ping rounded-full bg-sky/40" />}
          {initial}
        </span>
        <p className={large ? 'text-4xl font-bold' : 'text-2xl font-bold'}>{callee.name}</p>
        <p className={`${large ? 'text-xl' : 'text-sm'} text-primary-soft/80 tabular-nums`}>{callee.number}</p>
        <p className={`${large ? 'text-2xl' : 'text-base'} text-primary-soft`}>{connectedAt ? duration : 'Dzwonię…'}</p>
      </div>

      <div className="flex items-start justify-center gap-10 pb-8">
        <button onClick={() => setMuted((v) => !v)} className="flex flex-col items-center gap-2 text-sm">
          <span className={toggle(muted)}>{muted ? <MicOff /> : <Mic />}</span>
          Wycisz
        </button>
        <button onClick={() => setSpeaker((v) => !v)} className="flex flex-col items-center gap-2 text-sm">
          <span className={toggle(speaker)}>
            <Volume2 />
          </span>
          Głośnik
        </button>
      </div>
      <div className="px-4 pb-6">
        <button
          onClick={onEnd}
          className={`flex w-full items-center justify-center gap-3 rounded-[10px] bg-danger font-bold text-white ${large ? 'h-20 text-2xl' : 'h-14 text-lg'}`}
        >
          <PhoneOff size={large ? 30 : 22} /> Zakończ
        </button>
      </div>
    </div>
  )
}
