function Svg({ className = 'h-5 w-5', strokeWidth = 1.8, children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const SearchIcon = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
)

export const BagIcon = (p) => (
  <Svg className="h-6 w-6" {...p}>
    <path d="M5 8h14l-1 12H6L5 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </Svg>
)

export const UserIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Svg>
)

export const FlowerIcon = (p) => (
  <Svg className="h-6 w-6" strokeWidth={1.6} {...p}>
    <circle cx="12" cy="12" r="2.2" />
    <path d="M12 9.8C10.5 8 10.5 4.5 12 3c1.5 1.5 1.5 5 0 6.8Z" />
    <path d="M12 14.2c1.5 1.8 1.5 5.3 0 6.8-1.5-1.5-1.5-5 0-6.8Z" />
    <path d="M9.8 12C8 10.5 4.5 10.5 3 12c1.5 1.5 5 1.5 6.8 0Z" />
    <path d="M14.2 12c1.8-1.5 5.3-1.5 6.8 0-1.5 1.5-5 1.5-6.8 0Z" />
  </Svg>
)

export const PencilIcon = (p) => (
  <Svg className="h-4 w-4" {...p}>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
    <path d="m13.5 6.5 4 4" />
  </Svg>
)

export const TrashIcon = (p) => (
  <Svg className="h-4 w-4" {...p}>
    <path d="M4 7h16" />
    <path d="M9 7V4h6v3" />
    <path d="M6 7l1 13h10l1-13" />
  </Svg>
)

export const HeartIcon = (p) => (
  <Svg className="h-4 w-4" {...p}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
  </Svg>
)