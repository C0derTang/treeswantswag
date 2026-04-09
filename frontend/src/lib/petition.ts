import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
  increment,
} from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { getDb } from './firebase'

export type PetitionPayload = {
  displayName: string
  isRisingStudent: boolean
  major?: string
  testimonial?: {
    photoDataUrl: string
    quote: string
  } | null
}

function dateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export async function hasSigned(uid: string): Promise<boolean> {
  const db = getDb()
  const snap = await getDoc(doc(db, 'signatures', uid))
  return snap.exists()
}

export async function submitPetition(
  user: User,
  payload: PetitionPayload,
): Promise<void> {
  const db = getDb()
  const uid = user.uid
  const sigRef = doc(db, 'signatures', uid)
  const statsRef = doc(db, 'stats', 'global')
  const day = dateKey(new Date())

  await runTransaction(db, async (transaction) => {
    const sigSnap = await transaction.get(sigRef)
    if (sigSnap.exists()) {
      throw new Error('ALREADY_SIGNED')
    }
    const statsSnap = await transaction.get(statsRef)

    transaction.set(sigRef, {
      displayName: payload.displayName.trim(),
      isRisingStudent: payload.isRisingStudent,
      major: (payload.major ?? '').trim() || 'Undeclared',
      createdAt: serverTimestamp(),
    })

    if (!statsSnap.exists()) {
      transaction.set(statsRef, {
        total: 1,
        daily: { [day]: 1 },
        updatedAt: serverTimestamp(),
      })
    } else {
      transaction.update(statsRef, {
        total: increment(1),
        [`daily.${day}`]: increment(1),
        updatedAt: serverTimestamp(),
      })
    }
  })

  const t = payload.testimonial
  if (
    payload.isRisingStudent &&
    t &&
    t.photoDataUrl.length > 0 &&
    t.quote.trim().length > 0
  ) {
    await setDoc(doc(db, 'testimonials', uid), {
      displayName: payload.displayName.trim(),
      photoDataUrl: t.photoDataUrl,
      quote: t.quote.trim(),
      major: (payload.major ?? '').trim() || 'Undeclared',
      createdAt: serverTimestamp(),
    })
  }
}
