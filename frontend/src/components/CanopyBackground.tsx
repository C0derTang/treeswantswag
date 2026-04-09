export function CanopyBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Green-forward wash: backing behind predominantly white content */}
      <div className="absolute inset-0 bg-page-wash" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 via-transparent to-emerald-50/70"
        aria-hidden
      />
      <div
        className="absolute -left-1/4 top-0 h-[70%] w-[70%] rounded-full bg-emerald-200/25 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -right-1/4 bottom-0 h-[55%] w-[60%] rounded-full bg-teal-100/30 blur-3xl"
        aria-hidden
      />
      <div className="noise-overlay absolute inset-0 opacity-[0.035] mix-blend-multiply" />
      <svg
        className="absolute -right-24 bottom-0 w-[min(90vw,520px)] text-emerald-300/35"
        viewBox="0 0 400 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M40 280c40-80 120-140 200-160 60-14 120-8 160 20M60 240c50-60 110-100 180-120M20 200c30-50 90-90 150-100"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          d="M200 20c-20 40-20 90 0 140s50 80 90 100M240 60c-10 35-5 75 15 105"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
      <svg
        className="absolute -left-16 top-24 w-[min(70vw,380px)] text-emerald-200/40"
        viewBox="0 0 320 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <ellipse cx="160" cy="240" rx="120" ry="28" className="fill-emerald-100/50" />
        <path
          d="M160 240V80M120 200c20-30 50-50 80-50s60 20 80 50"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    </div>
  )
}
