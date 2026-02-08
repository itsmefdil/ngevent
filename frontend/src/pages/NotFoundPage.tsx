import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  useEffect(() => {
    document.title = '404 - Halaman Tidak Ditemukan - NgEvent'
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
          404
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Halaman yang Anda cari tidak ditemukan
        </p>
        <Link
          to="/"
          className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
        >
          <Home className="h-5 w-5 mr-2" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
