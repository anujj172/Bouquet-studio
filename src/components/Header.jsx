import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Flower2, Search, ShoppingBag, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import UserMenu from './UserMenu'

const linkClass = ({ isActive }) =>
  'rounded-full px-4 py-2 text-sm font-semibold ' + (isActive ? 'bg-blush/60' : 'hover:bg-stone-100')

export default function Header() {
  const { user, isAdmin } = useAuth()
  const cart = useCart()
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  function handleSearch(e) {
    e.preventDefault()
    navigate(q.trim() ? `/?search=${encodeURIComponent(q.trim())}` : '/')
  }

  return (
    <header className="border-b border-stone-200 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white">
            <Flower2 size={22} strokeWidth={1.75} />
          </span>
          <span className="font-serif text-2xl font-semibold">
            Bouquet <span className="italic text-brand">Studio</span>
          </span>
        </Link>

        <nav className="flex gap-1">
          <NavLink to="/" end className={linkClass}>Нүүр</NavLink>
          <NavLink to="/ready" className={linkClass}>Бэлэн баглаа</NavLink>
          <Link to="/#my-bouquet" className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-stone-100">
            Миний баглаа
          </Link>
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => linkClass({ isActive }) + ' text-brand'}>
              Админ
            </NavLink>
          )}
        </nav>

        <form onSubmit={handleSearch} className="ml-auto hidden max-w-md flex-1 md:block">
          <div className="flex items-center gap-3 rounded-full border border-stone-200 bg-white px-5 py-3 shadow-sm">
            <Search size={18} strokeWidth={1.75} className="shrink-0 text-stone-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Цэцэг хайх..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </form>

        <Link
          to="/cart"
          aria-label="Сагс"
          className="relative flex h-11 w-11 items-center justify-center rounded-full hover:bg-stone-100"
        >
          <ShoppingBag size={22} strokeWidth={1.75} />
          {cart.count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs font-semibold text-white">
              {cart.count}
            </span>
          )}
        </Link>

        {user ? (
          <UserMenu />
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-stone-100"
          >
            <User size={16} strokeWidth={1.75} />
            Нэвтрэх
          </Link>
        )}
      </div>
    </header>
  )
}