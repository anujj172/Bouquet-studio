import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/AuthLayout'
import Field from '../components/Field'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(form)
    setLoading(false)
    if (error) setError('И-мэйл эсвэл нууц үг буруу байна')
    else navigate(from, { replace: true })
  }

  return (
    <AuthLayout
      title="Нэвтрэх"
      footer={
        <>
          Бүртгэлгүй юу?{' '}
          <Link to="/register" className="font-semibold text-brand">
            Бүртгүүлэх
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="И-мэйл" required type="email" placeholder="you@mail.mn" value={form.email} onChange={set('email')} />
        <Field label="Нууц үг" required type="password" value={form.password} onChange={set('password')} />

        <div className="text-right">
          <Link to="/forgot-password" className="text-sm font-semibold text-brand">
            Нууц үгээ мартсан?
          </Link>
        </div>

        {error && <p className="rounded-2xl bg-red-50 px-5 py-3 text-sm text-red-700">{error}</p>}

        <button
          disabled={loading}
          className="w-full rounded-full bg-brand py-4 text-lg font-semibold text-white shadow-md hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
        </button>
      </form>
    </AuthLayout>
  )
}