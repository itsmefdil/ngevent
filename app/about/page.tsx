'use client';

import Navbar from "@/components/Navbar";
import { useLanguage } from "@/lib/language-context";

export default function AboutPage() {
    const { t } = useLanguage();

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 pt-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white dark:bg-dark-card rounded-lg shadow-sm p-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                                Tentang Ngevent
                            </h1>

                            <div className="space-y-8">
                                <section>
                                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                        Tentang Aplikasi Ngevent
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        Ngevent adalah platform inovatif yang dirancang untuk memudahkan pengelolaan dan partisipasi dalam berbagai acara online.
                                        Dengan antarmuka yang user-friendly dan fitur-fitur canggih, Ngevent membantu Anda mengorganisir acara,
                                        mengelola peserta, dan menciptakan pengalaman acara yang memorable.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                        Platform Management Event Online Gratis
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        Ngevent menyediakan platform lengkap untuk management event online secara gratis. Fitur-fitur utama meliputi:
                                    </p>
                                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-4 space-y-2">
                                        <li>Pembuatan dan pengelolaan acara online</li>
                                        <li>Sistem registrasi peserta otomatis</li>
                                        <li>Dashboard analitik dan pelaporan</li>
                                        <li>Antarmuka mobile-friendly</li>
                                        <li>Dukungan multi-bahasa</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                        Informasi Developer
                                    </h2>
                                    <div className="bg-gray-50 dark:bg-dark-secondary rounded-lg p-6">
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                            Ngevent adalah platform yang dibangun oleh komunitas DevOps Jogja dengan semangat kolaborasi dan inovasi.
                                            Sebagai proyek komunitas, kami berkomitmen untuk menjaga performa dan keamanan platform ini secara maksimal.
                                            Dengan menggunakan teknologi web modern seperti Next.js, TypeScript, dan Supabase, kami memastikan
                                            bahwa setiap aspek dari platform ini - mulai dari kecepatan loading hingga proteksi data pengguna -
                                            selalu dioptimalkan dan dijaga keamanannya.
                                        </p>
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                                <strong>Komunitas:</strong> DevOps Jogja
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                                <strong>Komitmen:</strong> Performa dan keamanan maksimal
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                                <strong>Teknologi:</strong> Next.js 16, TypeScript, Tailwind CSS, Supabase
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                        Dukungan untuk Perawatan Service dan Server
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                                        Sebagai platform yang dibangun oleh komunitas, kami berkomitmen secara maksimal untuk menjaga performa dan keamanan Ngevent.
                                        Komunitas DevOps Jogja secara aktif memantau dan memelihara platform ini untuk memastikan pengalaman pengguna yang optimal.
                                        Layanan dukungan kami meliputi:
                                    </p>
                                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                                        <li>Monitoring performa server 24/7 oleh komunitas</li>
                                        <li>Backup data otomatis dengan standar keamanan tinggi</li>
                                        <li>Update keamanan rutin dan patch keamanan</li>
                                        <li>Optimasi performa berkelanjutan</li>
                                        <li>Support teknis komunitas untuk troubleshooting</li>
                                        <li>Audit keamanan berkala</li>
                                    </ul>
                                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <p className="text-blue-800 dark:text-blue-200">
                                            <strong>Komitmen Komunitas:</strong> Kami akan semaksimal mungkin menjaga performa dan keamanan platform ini.
                                            Jika Anda mengalami masalah atau membutuhkan bantuan, silakan hubungi komunitas DevOps Jogja melalui
                                            email di support@ngevent.com atau forum komunitas kami.
                                        </p>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}