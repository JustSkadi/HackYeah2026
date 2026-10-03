// Pusty stan "brak danych": import z IKP od razu w tym miejscu (bez przechodzenia na inną stronę)
// i pod spodem "Dodaj lek ręcznie", który otwiera formularz w Lekach.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Loader2, Plus } from 'lucide-react'
import { importFromIkp } from '../../lib/ikp'

export default function ImportOrAdd({ title, text }: { title: string; text: string }) {
  const [importing, setImporting] = useState(false)

  const runImport = async () => {
    setImporting(true)
    try {
      await importFromIkp()
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="card flex flex-col items-center gap-3 text-center">
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-muted">{text}</p>
      <button
        onClick={runImport}
        disabled={importing}
        className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-primary px-5 py-2.5 font-semibold text-white disabled:opacity-70"
      >
        {importing ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
        {importing ? 'Łączenie z IKP…' : 'Importuj z IKP'}
      </button>
      {!importing && (
        <Link to="/opiekun/leki?dodaj=1" className="flex w-full items-center justify-center gap-2 rounded-[10px] border-2 border-primary px-5 py-2 font-semibold text-primary">
          <Plus size={18} /> Dodaj lek ręcznie
        </Link>
      )}
    </div>
  )
}
