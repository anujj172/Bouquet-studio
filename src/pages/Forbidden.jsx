import { Link } from 'react-router-dom'

export default function Forbidden() {
  return (
    <div className="py-24 text-center">
      <p className="font-serif text-8xl font-semibold text-brand">403</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold">Хандах эрхгүй</h1>
      <p className="mt-2 text-stone-600">Энэ хуудас зөвхөн администраторт нээлттэй.</p>
      <Link to="/" className="mt-6 inline-block rounded-full bg-brand px-6 py-3 font-semibold text-white">Нүүр хуудас руу</Link>
    </div>
  )
}