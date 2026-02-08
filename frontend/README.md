# Frontend - NgEvent (Vite + React)

Frontend application untuk NgEvent platform menggunakan Vite, React, TypeScript, dan Tailwind CSS.

## Tech Stack

- **Vite** - Build tool
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Routing
- **TanStack Query** - Data fetching & caching
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client
- **date-fns** - Date formatting

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Layout.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── pages/           # Page components
│   │   ├── HomePage.tsx
│   │   ├── EventsPage.tsx
│   │   ├── EventDetailPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── App.tsx          # Main app component with routes
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Features

- ✅ Modern UI with Tailwind CSS
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Type-safe with TypeScript
- ✅ Fast development with Vite HMR
- ✅ API integration ready
- ✅ Client-side routing
- ✅ Optimized data fetching with React Query

## API Integration

Frontend dikonfigurasi untuk berkomunikasi dengan backend API melalui proxy:

```typescript
// vite.config.ts
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
}
```

## Development

Server development akan berjalan di `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

Buat file `.env` di root folder frontend:

```env
VITE_API_URL=http://localhost:3001
```

## Deployment

Build aplikasi untuk production:

```bash
npm run build
```

Output akan berada di folder `dist/` yang siap untuk di-deploy ke hosting statis seperti:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

## License

MIT
