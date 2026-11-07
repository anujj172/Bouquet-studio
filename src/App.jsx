import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

export default function App() {
  const [status, setStatus] = useState('Шалгаж байна...')

  useEffect(() => {
    supabase
      .from('flowers')
      .select('name, unit_price')
      .limit(3)
      .then(({ data, error }) => {
        if (error) setStatus('Алдаа: ' + error.message)
        else setStatus('Холбогдлоо. Цэцэг: ' + data.map((f) => f.name).join(', '))
      })
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-pink-50">
      <h1 className="text-4xl font-bold text-rose-700">Bouquet Studio</h1>
      <p className="text-gray-700">{status}</p>
    </div>
  )
}