import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import { getDb } from '../lib/firebase'
import type { TestimonialItem } from '../types/testimonials'

type Props = {
  firebaseConfigured: boolean
}

/**
 * Each row gets ALL items but rotated by a different offset so rows
 * start on different cards, creating a mosaic effect.
 */
function offsetForRow<T>(items: T[], rowIndex: number): T[] {
  const n = items.length
  if (n <= 1) return items
  const shift = Math.floor(n / 3 + rowIndex * n * 0.37) % n
  return [...items.slice(shift), ...items.slice(0, shift)]
}

function stripWidthPx(itemCount: number, cardWidth: number, gap: number): number {
  if (itemCount <= 0) return 0
  return itemCount * cardWidth + Math.max(0, itemCount - 1) * gap
}

function buildSeamlessLoop<T>(items: T[], cardWidth: number, gap: number, minWidthPx: number): T[] {
  const n = items.length
  if (n === 0) return []
  const unit = stripWidthPx(n, cardWidth, gap)
  if (unit < 1) return [...items, ...items]
  const repeatsInSegment = Math.max(1, Math.ceil(minWidthPx / unit))
  const segment: T[] = []
  for (let r = 0; r < repeatsInSegment; r++) {
    for (let i = 0; i < n; i++) segment.push(items[i])
  }
  return [...segment, ...segment]
}

function layoutForRows(rowCount: number): { cardWidth: number; gap: number; textClass: string } {
  const cardWidth = Math.max(112, 232 - (rowCount - 1) * 22)
  const gap = Math.max(6, Math.min(28, 26 - (rowCount - 1) * 3))
  const textClass = rowCount >= 5 ? 'text-[11px]' : rowCount >= 3 ? 'text-xs' : 'text-sm'
  return { cardWidth, gap, textClass }
}

function rowDeckScale(rowCount: number): number {
  return Math.min(1, 5.8 / (rowCount + 2.2))
}

function TestimonialLightbox({
  item,
  onClose,
}: {
  item: TestimonialItem | null
  onClose: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!item) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [item, onClose])

  if (!item) return null

  const majorLabel =
    item.major && item.major !== 'Undeclared'
      ? `Incoming ${item.major} Major`
      : 'Incoming Undeclared Major'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-stone-900/55 backdrop-blur-[3px] transition-opacity"
        aria-label="Close testimonial"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="testimonial-lightbox-title"
        className="relative z-10 flex max-h-[min(90vh,820px)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-[0_32px_64px_-16px_rgba(15,40,30,0.35)] ring-1 ring-stone-100"
      >
        <div className="relative aspect-[4/3] w-full shrink-0 bg-stone-100 sm:aspect-[16/10]">
          {item.photoDataUrl ? (
            <img
              src={item.photoDataUrl}
              alt=""
              className="h-full w-full object-cover object-center"
            />
          ) : null}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-lg text-stone-600 shadow-md ring-1 ring-stone-200/80 transition hover:bg-white hover:text-stone-900"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-5 sm:px-8 sm:pb-8">
          <h3
            id="testimonial-lightbox-title"
            className="font-display text-2xl font-semibold text-stone-900 sm:text-3xl"
          >
            {item.displayName}
          </h3>
          <p className="mt-1 text-sm font-medium text-cardinal sm:text-base">{majorLabel}</p>
          {item.quote.trim().length > 0 ? (
            <blockquote className="mt-5 border-l-4 border-cardinal/25 pl-4 text-base leading-relaxed text-stone-700 sm:text-lg">
              &ldquo;{item.quote}&rdquo;
            </blockquote>
          ) : (
            <p className="mt-5 text-sm italic text-stone-400">No quote on file.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function Card({
  item,
  cardWidth,
  textClass,
}: {
  item: TestimonialItem
  cardWidth: number
  textClass: string
}) {
  const majorLabel = item.major && item.major !== 'Undeclared'
    ? `Incoming ${item.major} Major`
    : 'Incoming Undeclared Major'

  return (
    <div
      data-testimonial-id={item.id}
      className="shrink-0 [transform-style:preserve-3d]"
      style={{
        width: cardWidth,
        transform: 'perspective(900px) translateZ(14px) rotateY(-2deg)',
      }}
    >
      <article
        title="Tap to read full testimonial"
        className="relative h-full overflow-hidden rounded-2xl border border-stone-200 bg-white/95 p-2 shadow-[0_18px_40px_-10px_rgba(15,40,30,0.32),0_6px_12px_-6px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-cardinal/15 sm:p-2.5"
      >
        <div className="aspect-square overflow-hidden rounded-xl ring-1 ring-inset ring-stone-200/80">
          {item.photoDataUrl ? (
            <img
              src={item.photoDataUrl}
              alt=""
              draggable={false}
              className="pointer-events-none h-full w-full object-cover"
            />
          ) : null}
        </div>

        <div className="testimonial-text-reveal mt-1.5 space-y-0.5 sm:mt-2">
          <p className={`font-display font-semibold text-stone-900 ${textClass}`}>
            {item.displayName}
          </p>
          <p className={`leading-snug text-cardinal/70 ${textClass}`}>
            {majorLabel}
          </p>
          <p className={`line-clamp-3 leading-relaxed text-stone-600 ${textClass}`}>
            &ldquo;{item.quote}&rdquo;
          </p>
        </div>
      </article>
    </div>
  )
}

type MarqueeProps = {
  items: TestimonialItem[]
  reverse: boolean
  rowIndex: number
  cardWidth: number
  gap: number
  textClass: string
  deckScale: number
  onSelectItem: (item: TestimonialItem) => void
}

function DraggableMarqueeRow({
  items,
  reverse,
  rowIndex,
  cardWidth,
  gap,
  textClass,
  deckScale,
  onSelectItem,
}: MarqueeProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startScroll: 0,
    moved: false,
  })
  const [dragging, setDragging] = useState(false)
  const [viewportW, setViewportW] = useState(0)
  const rafRef = useRef(0)

  const minTrackPx =
    viewportW > 0
      ? viewportW
      : typeof window !== 'undefined'
        ? window.innerWidth
        : 1024

  const loop = useMemo(
    () => buildSeamlessLoop(items, cardWidth, gap, minTrackPx),
    [items, cardWidth, gap, minTrackPx],
  )

  const itemsContentKey = useMemo(
    () => items.map((x) => x.id).join('|'),
    [items],
  )

  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  useLayoutEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const sync = () => {
      setViewportW(el.clientWidth)
      if (dragRef.current.active) return
      const half = el.scrollWidth / 2
      if (half < 20) return
      if (reverse) el.scrollLeft = half
      else el.scrollLeft = 0
    }
    sync()
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(sync)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [reverse, itemsContentKey, cardWidth, gap, deckScale, viewportW])

  useEffect(() => {
    if (prefersReducedMotion) return undefined

    const speed = 0.55 + rowIndex * 0.04
    let cancelled = false

    const tick = () => {
      if (cancelled) return
      const el = scrollerRef.current
      if (!el) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      if (dragRef.current.active) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      const half = el.scrollWidth / 2
      if (half < 20) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      if (reverse) {
        el.scrollLeft -= speed
        if (el.scrollLeft <= 1) el.scrollLeft += half
      } else {
        el.scrollLeft += speed
        if (el.scrollLeft >= half - 1) el.scrollLeft -= half
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
    }
  }, [reverse, rowIndex, prefersReducedMotion, cardWidth, gap, deckScale, itemsContentKey, viewportW])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const scroller = scrollerRef.current
    const row = rowRef.current
    if (!scroller || !row) return
    dragRef.current.active = true
    dragRef.current.moved = false
    dragRef.current.startX = e.clientX
    dragRef.current.startY = e.clientY
    dragRef.current.startScroll = scroller.scrollLeft
    setDragging(true)
    row.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active) return
    const scroller = scrollerRef.current
    if (!scroller) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
      dragRef.current.moved = true
    }
    scroller.scrollLeft = dragRef.current.startScroll - dx
  }, [])

  const endDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current.active) return
      const wasTap = !dragRef.current.moved
      dragRef.current.active = false
      setDragging(false)
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      if (wasTap) {
        const hit = document.elementFromPoint(e.clientX, e.clientY)
        const node = hit?.closest('[data-testimonial-id]') as HTMLElement | null
        const id = node?.dataset.testimonialId
        if (id) {
          const picked = items.find((it) => it.id === id)
          if (picked) {
            onSelectItem(picked)
          }
        }
      }
    },
    [items, onSelectItem],
  )

  return (
    <div
      ref={rowRef}
      role="presentation"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={`testimonial-row group relative mx-auto h-full min-h-0 w-full max-w-full overflow-hidden [perspective:2000px] ${
        dragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{ touchAction: dragging ? 'none' : 'pan-x' }}
    >
      <div
        className="flex h-full min-h-0 w-full max-w-full items-center justify-center overflow-hidden"
        style={{
          transform: `scale(${deckScale})`,
          transformOrigin: 'center center',
        }}
      >
        <div
          className="max-h-full min-h-0 w-full min-w-0 max-w-full origin-center [transform-style:preserve-3d]"
          style={{
            transform: 'rotateX(11deg) translateZ(-12px)',
          }}
        >
          <div className="w-full min-w-0 max-w-full overflow-hidden py-0.5 [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
            <div
              ref={scrollerRef}
              className="marquee-scroller w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden select-none"
            >
              <div className="flex w-max flex-nowrap" style={{ gap }}>
                {loop.map((item, idx) => (
                  <Card
                    key={`${item.id}-r${rowIndex}-i${idx}`}
                    item={item}
                    cardWidth={cardWidth}
                    textClass={textClass}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TestimonialHero({ firebaseConfigured }: Props) {
  const [reals, setReals] = useState<TestimonialItem[]>([])
  const [rows, setRows] = useState(1)
  const [lightboxItem, setLightboxItem] = useState<TestimonialItem | null>(null)

  const openLightbox = useCallback((item: TestimonialItem) => {
    setLightboxItem(item)
  }, [])

  useEffect(() => {
    if (!firebaseConfigured) {
      setReals([])
      return
    }
    const db = getDb()
    const q = query(
      collection(db, 'testimonials'),
      orderBy('createdAt', 'desc'),
    )
    return onSnapshot(q, (snap) => {
      setReals(
        snap.docs.map((d) => {
          const x = d.data() as {
            displayName?: string
            photoDataUrl?: string
            quote?: string
            major?: string
          }
          return {
            id: d.id,
            displayName: x.displayName ?? 'Anonymous',
            photoDataUrl: x.photoDataUrl ?? '',
            quote: x.quote ?? '',
            major: x.major ?? 'Undeclared',
            isDummy: false,
          }
        }),
      )
    })
  }, [firebaseConfigured])

  const rowChunks = useMemo(
    () =>
      Array.from({ length: Math.max(1, Math.min(6, rows)) }, (_, rowIndex) =>
        offsetForRow(reals, rowIndex),
      ),
    [reals, rows],
  )

  const { cardWidth, gap, textClass } = layoutForRows(rows)
  const deckScale = rowDeckScale(rows)

  if (reals.length === 0) return null

  return (
    <section
      className="relative w-full shrink-0 overflow-hidden border-b border-emerald-200/40"
      aria-label="Testimonials"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-100/90 via-emerald-50/30 to-white"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(1px 1px at 20% 30%, rgba(30,80,60,0.35) 50%, transparent 51%),
            radial-gradient(1px 1px at 60% 70%, rgba(120,40,40,0.2) 50%, transparent 51%),
            radial-gradient(1px 1px at 80% 20%, rgba(30,80,60,0.25) 50%, transparent 51%),
            radial-gradient(1px 1px at 40% 80%, rgba(100,100,120,0.15) 50%, transparent 51%)`,
          backgroundSize: '100% 100%',
        }}
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-[min(100%,96rem)] px-4 pb-6 pt-5 sm:px-6 lg:px-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-cardinal/80">
              Hear from your future classmates
            </p>
            <h2 className="font-display text-xl font-semibold text-stone-900 md:text-2xl">
              Class of 2030 Wall
            </h2>
            <p className="mt-1 max-w-xl text-sm text-stone-500">
              Real students who signed the petition. Drag to scroll, or tap a card to read it in full.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-stone-500">Rows</span>
            <div className="flex rounded-full border border-stone-200 bg-white/90 p-0.5 shadow-sm backdrop-blur">
              <button
                type="button"
                className="rounded-full px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-100 disabled:opacity-40"
                disabled={rows <= 1}
                onClick={() => setRows((r) => Math.max(1, r - 1))}
              >
                &minus;
              </button>
              <span className="flex min-w-[2rem] items-center justify-center text-sm font-semibold tabular-nums text-cardinal">
                {rows}
              </span>
              <button
                type="button"
                className="rounded-full px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-100 disabled:opacity-40"
                disabled={rows >= 6}
                onClick={() => setRows((r) => Math.min(6, r + 1))}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[min(50vh,480px)] min-h-[200px] max-h-[480px] flex-col gap-0 overflow-hidden rounded-2xl border border-emerald-100/60 bg-white/30 shadow-inner ring-1 ring-stone-100/80">
          {rowChunks.map((rowItems, rowIndex) => {
            const reverse = rowIndex % 2 === 1

            return (
              <div
                key={`${rowIndex}-${rows}-${rowItems.length}`}
                className="relative flex min-h-0 flex-1 flex-col overflow-hidden border-b border-emerald-100/40 last:border-b-0"
                style={{ zIndex: rowIndex + 1 }}
              >
                <DraggableMarqueeRow
                  items={rowItems}
                  reverse={reverse}
                  rowIndex={rowIndex}
                  cardWidth={cardWidth}
                  gap={gap}
                  textClass={textClass}
                  deckScale={deckScale}
                  onSelectItem={openLightbox}
                />
              </div>
            )
          })}
        </div>
      </div>

      {lightboxItem != null &&
        createPortal(
          <TestimonialLightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />,
          document.body,
        )}
    </section>
  )
}
