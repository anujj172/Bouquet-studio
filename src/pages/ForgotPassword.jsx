import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/AuthLayout'
import Field from '../components/Field'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('И-мэйлийн формат буруу байна')
      return
    }
    setLoading(true)
    await resetPassword(email)
    setLoading(false)
    // Бүртгэлтэй эсэхийг задруулахгүйн тулд үргэлж ижил мэдэгдэл харуулна
    setSent(true)
  }

  return (
    <AuthLayout
      title="Нууц үг сэргээх"
      subtitle="Бүртгэлтэй и-мэйлээ оруулбал сэргээх холбоос илгээнэ."
      footer={
        <Link to="/login" className="font-semibold text-brand">
          Нэвтрэх хуудас руу буцах
        </Link>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Field label="И-мэйл" required type="email" placeholder="you@mail.mn" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
        {sent && (
          <p className="rounded-2xl bg-green-50 px-5 py-3 text-sm text-green-800">
            Сэргээх холбоос илгээгдлээ. И-мэйлээ шалгана уу.
          </p>
        )}
        <button
          disabled={loading}
          className="w-full rounded-full bg-brand py-4 text-lg font-semibold text-white shadow-md hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? 'Илгээж байна...' : 'Холбоос илгээх'}
        </button>
      </form>
    </AuthLayout>
  )
}