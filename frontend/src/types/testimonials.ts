export type TestimonialItem = {
  id: string
  displayName: string
  photoDataUrl: string
  quote: string
  major?: string
  /** Placeholder until Firestore fills in */
  isDummy?: boolean
}
