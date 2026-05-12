# TreesWantSwag — Class of 2030 petition site

Vite + React + Tailwind + Firebase (Google Auth + Firestore). Copy `frontend/.env.example` to `frontend/.env`, add Firebase keys, enable **Google** sign-in, create **Firestore**, and deploy `firestore.rules` (Firebase console → Firestore → Rules, or `firebase deploy --only firestore:rules` if using Firebase CLI).

```bash
cd frontend
npm install
npm run dev
```

Build: `npm run build` inside `frontend`.


Live site: https://treeswantswag.web.app/
