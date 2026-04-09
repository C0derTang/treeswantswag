import { useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { fileToCompressedDataUrl } from '../lib/image'
import {
  getSignatureForUser,
  getUserTestimonial,
  saveTestimonial,
} from '../lib/petition'
import { GlassPanel } from './GlassPanel'

type Props = {
  user: User
}

export function TestimonialManager({ user }: Props) {
  const [loading, setLoading] = useState(true)
  const [rising, setRising] = useState(false)
  const [hasExisting, setHasExisting] = useState(false)
  const [quote, setQuote] = useState('')
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setProfileError(null)
      try {
        const sig = await getSignatureForUser(user.uid)
        const t = await getUserTestimonial(user.uid)
        if (cancelled) return
        setRising(sig?.isRisingStudent ?? false)
        if (t && t.quote.trim().length > 0 && t.photoDataUrl.length > 0) {
          setHasExisting(true)
          setQuote(t.quote)
          setPhotoDataUrl(t.photoDataUrl)
        } else {
          setHasExisting(false)
          setQuote('')
          setPhotoDataUrl(null)
        }
      } catch {
        if (!cancelled) setProfileError('Could not load your profile.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [user.uid])

  async function onFileChange(f: File | null) {
    setError(null)
    if (!f) return
    try {
      const url = await fileToCompressedDataUrl(f)
      setPhotoDataUrl(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not process image')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const q = quote.trim()
    const photo = photoDataUrl ?? ''
    if (!photo || q.length === 0) {
      setError('Add a photo and a quote to publish on the wall.')
      return
    }

    setBusy(true)
    try {
      await saveTestimonial(user, { photoDataUrl: photo, quote: q })
      setHasExisting(true)
      setSavedFlash(true)
      window.setTimeout(() => setSavedFlash(false), 2500)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Save failed'
      if (msg === 'NOT_RISING') {
        setError('Only rising students can post on the testimonial wall.')
      } else if (msg === 'NOT_SIGNED') {
        setError('Signature not found. Try refreshing the page.')
      } else {
        setError(msg)
      }
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <GlassPanel className="p-6 text-center text-stone-500 md:p-8">
        Loading your petition profile&hellip;
      </GlassPanel>
    )
  }

  if (profileError) {
    return (
      <GlassPanel className="border-amber-200 bg-amber-50/90 p-6 text-sm text-amber-950 md:p-8">
        {profileError}
      </GlassPanel>
    )
  }

  if (!rising) {
    return null
  }

  return (
    <GlassPanel className="p-6 md:p-8">
      <h3 className="font-display text-lg font-semibold text-stone-900">
        {hasExisting ? 'Your testimonial on the wall' : 'Add your testimonial'}
      </h3>
      <p className="mt-1 text-sm text-stone-600">
        {hasExisting
          ? 'Update your photo or quote any time. Changes appear on the carousel above.'
          : 'You signed as a rising student but did not add a wall post yet. Add a photo and quote to appear in the carousel.'}
      </p>

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700" htmlFor="tm-photo">
            Photo
          </label>
          <input
            id="tm-photo"
            type="file"
            accept="image/*"
            className="mt-2 block w-full text-sm text-stone-600 file:mr-4 file:rounded-lg file:border-0 file:bg-cardinal file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-cardinal-light"
            onChange={(e) => void onFileChange(e.target.files?.[0] ?? null)}
          />
          {photoDataUrl ? (
            <img
              src={photoDataUrl}
              alt=""
              className="mt-3 h-40 w-40 rounded-xl object-cover ring-2 ring-stone-200"
            />
          ) : null}
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700" htmlFor="tm-quote">
            Quote
          </label>
          <textarea
            id="tm-quote"
            rows={4}
            className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-cardinal focus:outline-none focus:ring-2 focus:ring-cardinal/25"
            placeholder="A sentence about why this matters to you…"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
          />
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}
        {savedFlash && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Saved. Your testimonial will update on the wall shortly.
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-2xl bg-cardinal px-6 py-3 font-display font-semibold text-white shadow-md shadow-cardinal/20 transition hover:bg-cardinal-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Saving…' : hasExisting ? 'Update testimonial' : 'Publish testimonial'}
        </button>
      </form>
    </GlassPanel>
  )
}
