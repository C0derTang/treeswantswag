import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { getFirebaseAuth, googleProvider, isFirebaseConfigured } from './lib/firebase'
import { hasSigned } from './lib/petition'
import { CanopyBackground } from './components/CanopyBackground'
import { GlassPanel } from './components/GlassPanel'
import { PetitionForm } from './components/PetitionForm'
import { StatsChart } from './components/StatsChart'
import { TestimonialHero } from './components/TestimonialHero'
import type { User } from 'firebase/auth'

function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false)
      return
    }
    const auth = getFirebaseAuth()
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  return { user, loading }
}

export default function App() {
  const { user, loading } = useAuth()
  const [signed, setSigned] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!user || !isFirebaseConfigured()) {
      setSigned(null)
      return
    }
    setChecking(true)
    void hasSigned(user.uid)
      .then(setSigned)
      .finally(() => setChecking(false))
  }, [user])

  async function signIn() {
    if (!isFirebaseConfigured()) return
    const auth = getFirebaseAuth()
    await signInWithPopup(auth, googleProvider)
  }

  async function logOut() {
    if (!isFirebaseConfigured()) return
    await signOut(getFirebaseAuth())
  }

  const configured = isFirebaseConfigured()

  return (
    <div className="relative min-h-screen font-body">
      <CanopyBackground />

      <header className="mx-auto flex w-full max-w-[min(100%,96rem)] items-center justify-between px-4 py-5 sm:px-6 lg:px-10">
        <div className="flex items-center gap-2">
          <img
            src="/chillguy.jpg"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg object-cover shadow-sm ring-1 ring-stone-200/80"
          />
          <span className="font-display text-lg font-semibold tracking-tight text-cardinal">
            TreesWantSwag
          </span>
        </div>
        {configured && user && (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-stone-500 sm:inline">
              {user.displayName ?? user.email}
            </span>
            <button
              type="button"
              onClick={() => void logOut()}
              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 shadow-sm transition hover:border-cardinal/40 hover:text-cardinal"
            >
              Sign out
            </button>
          </div>
        )}
      </header>

      <TestimonialHero firebaseConfigured={configured} />

      <main className="mx-auto w-full max-w-[min(100%,96rem)] space-y-12 px-4 pb-20 sm:px-6 lg:px-10">
        {!configured && (
          <GlassPanel className="border-amber-200 bg-amber-50/90 p-6 ring-amber-100">
            <h1 className="font-display text-xl font-semibold text-amber-950">
              Configure Firebase
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-amber-900/90">
              Copy <code className="rounded bg-white px-1.5 py-0.5 text-xs ring-1 ring-amber-200">.env.example</code> to{' '}
              <code className="rounded bg-white px-1.5 py-0.5 text-xs ring-1 ring-amber-200">.env</code> and add your
              Firebase project keys. Enable <strong>Google</strong> sign-in and create a{' '}
              <strong>Firestore</strong> database, then deploy{' '}
              <code className="rounded bg-white px-1.5 py-0.5 text-xs ring-1 ring-amber-200">firestore.rules</code>{' '}
              from the repo root.
            </p>
          </GlassPanel>
        )}

        <GlassPanel className="p-8 md:p-12">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-10">
            <div className="flex-1">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-cardinal">
                Stanford &middot; Class of 2030
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-stone-900 md:text-5xl">
                TreesWantSwag
              </h1>
              <p className="mt-2 text-lg font-medium text-stone-700 md:text-xl">
                We want our swag. Sign the petition.
              </p>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-stone-600">
                Students deserve clarity and care around admissions communications.
                Add your name&mdash;<span className="font-medium text-cardinal">one signature per Google account</span>&mdash;to
                show support for delivering a proper acceptance package experience for the Class of 2030.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-1.5 rounded-2xl border border-cardinal/15 bg-cardinal/[0.04] px-6 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-cardinal/70">Goal</p>
              <p className="font-display text-4xl font-bold tabular-nums text-cardinal">1,000</p>
              <p className="text-xs text-stone-500">signatures</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-stone-400">
            Fan project &middot; not affiliated with Stanford University. Testimonials you add are public.
          </p>
        </GlassPanel>

        {configured && (
          <>
            <section className="space-y-6">
              {loading ? (
                <p className="text-center text-stone-500">Loading&hellip;</p>
              ) : !user ? (
                <GlassPanel className="p-8 text-center md:p-10">
                  <h2 className="font-display text-xl font-semibold text-stone-900">
                    Join your classmates
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-stone-600">
                    Sign in with your Google account to add your name. It only takes a few seconds.
                  </p>
                  <button
                    type="button"
                    onClick={() => void signIn()}
                    className="mt-6 inline-flex items-center justify-center gap-2.5 rounded-2xl bg-cardinal px-8 py-4 font-display font-semibold text-white shadow-md shadow-cardinal/20 transition hover:bg-cardinal-light active:scale-[0.98]"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                </GlassPanel>
              ) : checking ? (
                <p className="text-center text-stone-500">Checking your signature&hellip;</p>
              ) : signed ? (
                <GlassPanel className="p-8 text-center md:p-10">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">
                    &#10003;
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-stone-900">
                    You&rsquo;re on the list!
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-stone-600">
                    Thanks for signing{user.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}.
                    Your voice is counted in the tally below.
                    Share this page with your future classmates!
                  </p>
                </GlassPanel>
              ) : (
                <PetitionForm user={user} onSuccess={() => setSigned(true)} />
              )}
            </section>

            <StatsChart />
          </>
        )}
      </main>

      <footer className="mx-auto w-full max-w-[min(100%,96rem)] space-y-1 px-4 pb-10 text-center text-xs text-stone-400 sm:px-6 lg:px-10">
        <p>One signature per Google account &middot; No IP-based tracking</p>
        <p>&copy; Christopher Tang 2026</p>
      </footer>
    </div>
  )
}
