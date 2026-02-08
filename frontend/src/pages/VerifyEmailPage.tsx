import { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'
import apiClient from '../lib/axios'

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')
    const token = searchParams.get('token')

    useEffect(() => {
        document.title = 'Verifikasi Email - NgEvent'
    }, [])

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setStatus('error')
                setMessage('Token verifikasi tidak valid atau tidak ditemukan.')
                return
            }

            try {
                const response = await apiClient.post('/api/auth/verify-email', { token })
                setStatus('success')
                setMessage(response.data.message || 'Email berhasil diverifikasi!')

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login')
                }, 3000)
            } catch (error: any) {
                setStatus('error')
                setMessage(error.response?.data?.error || 'Gagal memverifikasi email. Token mungkin sudah kadaluarsa.')
            }
        }

        verifyEmail()
    }, [token, navigate])

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-primary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                        {status === 'loading' && (
                            <>
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                                    <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Memverifikasi Email
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Mohon tunggu sebentar...
                                </p>
                            </>
                        )}

                        {status === 'success' && (
                            <>
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Email Terverifikasi!
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    {message}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                    Anda akan diarahkan ke halaman login dalam beberapa detik...
                                </p>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors"
                                >
                                    Login Sekarang
                                </Link>
                            </>
                        )}

                        {status === 'error' && (
                            <>
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                                    <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Verifikasi Gagal
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    {message}
                                </p>
                                <div className="space-y-3">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors"
                                    >
                                        Ke Halaman Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <Mail className="h-5 w-5 mr-2" />
                                        Daftar Ulang
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Link
                        to="/"
                        className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                    >
                        ← Kembali ke Beranda
                    </Link>
                </div>
            </div>
        </div>
    )
}
