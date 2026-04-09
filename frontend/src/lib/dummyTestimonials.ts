import type { TestimonialItem } from '../types/testimonials'

/** Abstract gradient tiles (no text) — placeholders until Firestore fills slots. */
const faces = [
  'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><defs><linearGradient id="g0" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#cfe8d8"/><stop offset="100%" stop-color="#9ec4b2"/></linearGradient></defs><rect width="160" height="160" rx="20" fill="url(#g0)"/><ellipse cx="80" cy="72" rx="36" ry="40" fill="white" opacity="0.25"/></svg>`,
    ),
  'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e8ddd4"/><stop offset="100%" stop-color="#c4a89c"/></linearGradient></defs><rect width="160" height="160" rx="20" fill="url(#g1)"/><ellipse cx="80" cy="72" rx="36" ry="40" fill="white" opacity="0.2"/></svg>`,
    ),
  'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#d8e8e0"/><stop offset="100%" stop-color="#8fb3a1"/></linearGradient></defs><rect width="160" height="160" rx="20" fill="url(#g2)"/><ellipse cx="80" cy="72" rx="36" ry="40" fill="white" opacity="0.22"/></svg>`,
    ),
  'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><defs><linearGradient id="g3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e2e8e4"/><stop offset="100%" stop-color="#a8b8b0"/></linearGradient></defs><rect width="160" height="160" rx="20" fill="url(#g3)"/><ellipse cx="80" cy="72" rx="36" ry="40" fill="white" opacity="0.18"/></svg>`,
    ),
  'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><defs><linearGradient id="g4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#dceee4"/><stop offset="100%" stop-color="#7aab95"/></linearGradient></defs><rect width="160" height="160" rx="20" fill="url(#g4)"/><ellipse cx="80" cy="72" rx="36" ry="40" fill="white" opacity="0.24"/></svg>`,
    ),
  'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><defs><linearGradient id="g5" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#eee8dc"/><stop offset="100%" stop-color="#b8a892"/></linearGradient></defs><rect width="160" height="160" rx="20" fill="url(#g5)"/><ellipse cx="80" cy="72" rx="36" ry="40" fill="white" opacity="0.2"/></svg>`,
    ),
  'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><defs><linearGradient id="g6" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#d4eae0"/><stop offset="100%" stop-color="#86b89f"/></linearGradient></defs><rect width="160" height="160" rx="20" fill="url(#g6)"/><ellipse cx="80" cy="72" rx="36" ry="40" fill="white" opacity="0.21"/></svg>`,
    ),
  'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><defs><linearGradient id="g7" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e8ece9"/><stop offset="100%" stop-color="#9cada3"/></linearGradient></defs><rect width="160" height="160" rx="20" fill="url(#g7)"/><ellipse cx="80" cy="72" rx="36" ry="40" fill="white" opacity="0.19"/></svg>`,
    ),
  'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><defs><linearGradient id="g8" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e0ebe6"/><stop offset="100%" stop-color="#92b5a4"/></linearGradient></defs><rect width="160" height="160" rx="20" fill="url(#g8)"/><ellipse cx="80" cy="72" rx="36" ry="40" fill="white" opacity="0.23"/></svg>`,
    ),
  'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><defs><linearGradient id="g9" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ecf2ee"/><stop offset="100%" stop-color="#aabfb4"/></linearGradient></defs><rect width="160" height="160" rx="20" fill="url(#g9)"/><ellipse cx="80" cy="72" rx="36" ry="40" fill="white" opacity="0.17"/></svg>`,
    ),
]

export const DUMMY_COUNT = 10

export function getDummyTestimonials(): TestimonialItem[] {
  return Array.from({ length: DUMMY_COUNT }, (_, i) => ({
    id: `dummy-${i}`,
    displayName: '',
    quote: '',
    photoDataUrl: faces[i % faces.length],
    isDummy: true,
  }))
}
