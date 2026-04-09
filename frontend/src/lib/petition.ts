import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
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

export type SignatureRecord = {
  displayName: string
  isRisingStudent: boolean
  major: string
}

export async function getSignatureForUser(uid: string): Promise<SignatureRecord | null> {
  const db = getDb()
  const snap = await getDoc(doc(db, 'signatures', uid))
  if (!snap.exists()) return null
  const d = snap.data()
  return {
    displayName: typeof d.displayName === 'string' ? d.displayName : '',
    isRisingStudent: Boolean(d.isRisingStudent),
    major: typeof d.major === 'string' && d.major.length > 0 ? d.major : 'Undeclared',
  }
}

export type UserTestimonialRecord = {
  photoDataUrl: string
  quote: string
  displayName: string
  major: string
}

export async function getUserTestimonial(uid: string): Promise<UserTestimonialRecord | null> {
  const db = getDb()
  const snap = await getDoc(doc(db, 'testimonials', uid))
  if (!snap.exists()) return null
  const d = snap.data()
  return {
    photoDataUrl: typeof d.photoDataUrl === 'string' ? d.photoDataUrl : '',
    quote: typeof d.quote === 'string' ? d.quote : '',
    displayName: typeof d.displayName === 'string' ? d.displayName : '',
    major: typeof d.major === 'string' ? d.major : 'Undeclared',
  }
}

/**
 * Create or update the signed-in user’s testimonial. Only allowed if their signature says they are a rising student.
 */
export async function saveTestimonial(
  user: User,
  input: { photoDataUrl: string; quote: string },
): Promise<void> {
  const db = getDb()
  const uid = user.uid
  const sig = await getSignatureForUser(uid)
  if (!sig) {
    throw new Error('NOT_SIGNED')
  }
  if (!sig.isRisingStudent) {
    throw new Error('NOT_RISING')
  }
  const quote = input.quote.trim()
  if (!input.photoDataUrl || quote.length === 0) {
    throw new Error('Photo and quote are required.')
  }

  const tRef = doc(db, 'testimonials', uid)
  const existing = await getDoc(tRef)
  const displayName = sig.displayName.trim() || 'Anonymous'
  const major = sig.major.trim() || 'Undeclared'

  const core = {
    displayName,
    photoDataUrl: input.photoDataUrl,
    quote,
    major,
    updatedAt: serverTimestamp(),
  }

  if (!existing.exists()) {
    await setDoc(tRef, {
      ...core,
      createdAt: serverTimestamp(),
    })
  } else {
    await updateDoc(tRef, core)
  }
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
