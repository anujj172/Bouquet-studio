import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, Package, Settings, Flower2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const item = 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] hover:bg-stone-100'

export default function UserMenu() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onDoc = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const name = profile?.full_name || user.email?.split('@')[0] || 'Хэрэглэгч'

  async function handleSignOut() {
    setOpen(false)
    await signOut()
    navigate('/')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 hover:bg-stone-100"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e3efe5] font-semibold uppercase">
          {name[0]}
        </span>
        <span className="font-semibold">{name}</span>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-3 w-72 rounded-3xl bg-white p-2 shadow-xl ring-1 ring-stone-100">
          <div className="px-4 py-3">
            <p className="font-semibold">{name}</p>
            <p className="text-sm text-stone-500">{user.email}</p>
          </div>
          <div className="border-t border-stone-100 pt-2">
            <Link to="/profile?tab=orders" onClick={() => setOpen(false)} className={item}>
              <Package size={18} strokeWidth={1.75} /> Миний захиалгууд
            </Link>
            <Link to="/profile?tab=bouquets" onClick={() => setOpen(false)} className={item}>
              <Flower2 size={18} strokeWidth={1.75} /> Миний баглаанууд
            </Link>
            <Link to="/profile?tab=profile" onClick={() => setOpen(false)} className={item}>
              <Settings size={18} strokeWidth={1.75} /> Профайл ба хаяг
            </Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setOpen(false)} className={item}>
                <LayoutDashboard size={18} strokeWidth={1.75} /> Админ самбар
              </Link>
            )}
          </div>
          <div className="mt-2 border-t border-stone-100 pt-2">
            <button type="button" onClick={handleSignOut} className={item + ' w-full text-left'}>
              <LogOut size={18} strokeWidth={1.75} /> Гарах
            </button>
          </div>
        </div>
      )}
    </div>
  )
}