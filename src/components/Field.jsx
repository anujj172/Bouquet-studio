import { useState } from 'react'

function EyeIcon({ off }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  )
}

export default function Field({ label, error, required, type = 'text', ...props }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'

  return (
    <label className="block">
      <span className="text-sm font-semibold">
        {label} {required && <span className="text-brand">*</span>}
      </span>
      <span className="relative mt-2 block">
        <input
          {...props}
          type={isPassword && show ? 'text' : type}
          className={
            'w-full rounded-full border bg-white/80 px-6 py-4 text-base shadow-sm outline-none focus:ring-2 focus:ring-brand/30 ' +
            (isPassword ? 'pr-14 ' : '') +
            (error ? 'border-red-500' : 'border-stone-200')
          }
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Нууц үг нуух' : 'Нууц үг харах'}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-ink"
          >
            <EyeIcon off={show} />
          </button>
        )}
      </span>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}