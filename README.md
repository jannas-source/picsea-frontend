# PicSea Frontend

AI-powered marine parts identification platform by 7-SENSE.

## Tech Stack
- **Framework:** Next.js 16 (React 19)
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Backend API:** https://api.picsea.app

## Brand Guidelines
- **Colors:** Bioluminescent Cyan (`#00F0FF`), Deep Abyss Blue (`#000C18`), Oceanic Navy (`#002B45`)
- **Typography:** Geometric Sans (Montserrat/Gotham) for display, Humanist Sans (Inter/Roboto) for body
- **Design:** Marine Intelligence theme with bioluminescent accents

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Static export to /out
```

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Auto-deploys on push to main
4. Configure custom domain: www.picse.app

### Manual Deploy
```bash
npm run build
# Upload /out folder to any static host
```

## API Integration

All searches hit: `https://api.picsea.app/api/parts/search`

Example:
```bash
curl "https://api.picsea.app/api/parts/search?q=jabsco&limit=5"
```

## Features
- ✅ Live parts search (29,294 CWR catalog)
- ✅ Real-time pricing & stock
- ✅ Part detail modal with dealer/list pricing
- ✅ Responsive design
- ✅ Bioluminescent theme with animations
- 🚧 Photo upload (coming soon)
- 🚧 AI visual recognition (coming soon)

## Monday Demo Ready
- Backend API: **LIVE** ✅
- Frontend UI: **LIVE** ✅
- Search: **WORKING** ✅
- Branding: **ON-BRAND** ✅
