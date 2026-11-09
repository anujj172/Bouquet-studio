const AUTH_IMAGE = '/flowers/hero-bouquet.jpg'

export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-2 lg:items-center">
      <div className="hidden overflow-hidden rounded-[2rem] lg:block">
        <img src={AUTH_IMAGE} alt="" className="h-[640px] w-full object-cover" />
      </div>

      <div className="mx-auto w-full max-w-xl">
        <h1 className="font-serif text-6xl font-semibold">{title}</h1>
        <p className="mt-3 text-lg text-stone-600">{subtitle}</p>
        <div className="mt-8">{children}</div>
        {footer && <p className="mt-6 text-center text-stone-600">{footer}</p>}
      </div>
    </div>
  )
}