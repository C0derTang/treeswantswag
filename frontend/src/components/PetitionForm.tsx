import { useState } from 'react'
import type { User } from 'firebase/auth'
import { fileToCompressedDataUrl } from '../lib/image'
import { submitPetition } from '../lib/petition'

type Props = {
  user: User
  onSuccess: () => void
}

export function PetitionForm({ user, onSuccess }: Props) {
  const [displayName, setDisplayName] = useState(
    user.displayName?.split(' ').slice(0, 2).join(' ') ?? '',
  )
  const [isRising, setIsRising] = useState<boolean | null>(null)
  const [major, setMajor] = useState('')
  const [quote, setQuote] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onFileChange(f: File | null) {
    setPhotoPreview(null)
    if (!f) return
    try {
      const url = await fileToCompressedDataUrl(f)
      setPhotoPreview(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not process image')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const name = displayName.trim()
    if (name.length < 2) {
      setError('Please enter your name.')
      return
    }
    if (isRising === null) {
      setError('Please indicate whether you are a rising student.')
      return
    }

    const hasQuote = quote.trim().length > 0
    const hasPhoto = Boolean(photoPreview && photoPreview.length > 0)

    if (isRising && (hasQuote !== hasPhoto)) {
      setError('For a testimonial, include both a photo and a quote (or leave both empty).')
      return
    }

    setBusy(true)
    try {
      await submitPetition(user, {
        displayName: name,
        isRisingStudent: isRising,
        major: major.trim() || undefined,
        testimonial:
          isRising && hasPhoto && hasQuote && photoPreview
            ? { photoDataUrl: photoPreview, quote: quote.trim() }
            : null,
      })
      onSuccess()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submit failed'
      if (msg === 'ALREADY_SIGNED') {
        onSuccess()
      } else {
        setError(msg)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-stone-200/90 bg-white/95 p-6 shadow-glass-light backdrop-blur-sm md:p-8"
    >
      <div>
        <label className="block text-sm font-medium text-stone-700" htmlFor="name">
          Display name
        </label>
        <input
          id="name"
          className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-cardinal focus:outline-none focus:ring-2 focus:ring-cardinal/25"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          autoComplete="name"
          required
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-stone-700">
          Are you a rising student?
        </legend>
        <div className="flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-backing-mist/50 px-4 py-3 transition hover:border-cardinal/35">
            <input
              type="radio"
              name="rising"
              className="accent-cardinal"
              checked={isRising === true}
              onChange={() => setIsRising(true)}
            />
            <span className="text-sm text-stone-700">Yes, I’m a rising student</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-backing-mist/50 px-4 py-3 transition hover:border-cardinal/35">
            <input
              type="radio"
              name="rising"
              className="accent-cardinal"
              checked={isRising === false}
              onChange={() => setIsRising(false)}
            />
            <span className="text-sm text-stone-700">No</span>
          </label>
        </div>
      </fieldset>

      <div>
        <label className="block text-sm font-medium text-stone-700" htmlFor="major">
          Intended major{' '}
          <span className="font-normal text-stone-400">(leave blank for Undeclared)</span>
        </label>
        <input
          id="major"
          className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-cardinal focus:outline-none focus:ring-2 focus:ring-cardinal/25"
          value={major}
          onChange={(e) => setMajor(e.target.value)}
          placeholder="e.g. Computer Science"
        />
      </div>

      {isRising === true && (
        <div className="space-y-4 rounded-2xl border border-emerald-200/80 bg-backing-mist/60 p-4 ring-1 ring-emerald-100/80">
          <p className="text-sm text-stone-600">
            Optional: add a public testimonial with your face and a short quote. Leave both
            blank to only be counted in the tally.
          </p>
          <div>
            <label className="block text-sm font-medium text-stone-700" htmlFor="photo">
              Photo
            </label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              className="mt-2 block w-full text-sm text-stone-600 file:mr-4 file:rounded-lg file:border-0 file:bg-cardinal file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-cardinal-light"
              onChange={(e) => void onFileChange(e.target.files?.[0] ?? null)}
            />
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Preview"
                className="mt-3 h-40 w-40 rounded-xl object-cover ring-2 ring-stone-200"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700" htmlFor="quote">
              Quote
            </label>
            <textarea
              id="quote"
              rows={3}
              className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-cardinal focus:outline-none focus:ring-2 focus:ring-cardinal/25"
              placeholder="A sentence about why this matters to you…"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-2xl bg-cardinal px-6 py-4 font-display text-lg font-semibold text-white shadow-md shadow-cardinal/20 transition hover:bg-cardinal-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? 'Submitting…' : 'Submit to the petition'}
      </button>
    </form>
  )
}
