import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/AuthLayout'
import Field from '../components/Field'

function validate(f) {
  const e = {}
  if (!f.fullName.trim()) e.fullName = 'Овог нэрээ оруулна уу'
  if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'И-мэйлийн формат буруу байна'
  if (!/^\d{8}$/.test(f.phone)) e.phone = 'Утасны дугаар 8 оронтой тоо байх ёстой'
  if (f.password.length < 8) e.password = 'Нууц үг 8-аас доошгүй тэмдэгттэй байх ёстой'
  return e
}

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    const v = validate(form)
    setErrors(v)
    if (Object.keys(v).length) return

    setLoading(true)
    const { data, error } = await signUp(form)
    setLoading(false)

    if (error) {
      setServerError(
        error.message.toLowerCase().includes('already')
          ? 'Энэ и-мэйл бүртгэлтэй байна'
          : 'Бүртгүүлэхэд алдаа гарлаа: ' + error.message
      )
    } else if (data.session) {
      navigate('/', { replace: true })
    } else {
      setInfo('Бүртгэл амжилттай. И-мэйлээ шалгаж баталгаажуулна уу.')
    }
  }

  return (
    <AuthLayout
      title="Бүртгүүлэх"
      footer={
        <>
          Бүртгэлтэй юу?{' '}
          <Link to="/login" className="font-semibold text-brand">
            Нэвтрэх
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Field label="Овог нэр" required value={form.fullName} onChange={set('fullName')} error={errors.fullName} />
        <Field label="И-мэйл" required type="email" value={form.email} onChange={set('email')} error={errors.email} />
        <Field
          label="Утасны дугаар"
          required
          inputMode="numeric"
          maxLength={8}
          placeholder="99112233"
          value={form.phone}
          onChange={set('phone')}
          error={errors.phone}
        />
        <Field label="Нууц үг" required type="password" value={form.password} onChange={set('password')} error={errors.password} />

        {serverError && <p className="rounded-2xl bg-red-50 px-5 py-3 text-sm text-red-700">{serverError}</p>}
        {info && <p className="rounded-2xl bg-green-50 px-5 py-3 text-sm text-green-800">{info}</p>}

        <button
          disabled={loading}
          className="w-full rounded-full bg-brand py-4 text-lg font-semibold text-white shadow-md hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
        </button>
      </form>
    </AuthLayout>
  )
}