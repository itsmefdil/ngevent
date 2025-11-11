'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import EditProfileSkeleton from '@/components/EditProfileSkeleton';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function EditProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        institution: '',
        position: '',
        city: '',
        avatar_url: '',
    });

    useEffect(() => {
        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const checkAuth = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error('Anda harus login terlebih dahulu');
                router.push('/auth/login');
                return;
            }

            // Load existing profile
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            if (profile) {
                setFormData({
                    full_name: profile.full_name || '',
                    phone: profile.phone || '',
                    institution: profile.institution || '',
                    position: profile.position || '',
                    city: profile.city || '',
                    avatar_url: profile.avatar_url || '',
                });
                setAvatarPreview(profile.avatar_url || '');
            }

            setAuthChecked(true);
        } catch (error: any) {
            console.error('Error:', error);
            toast.error(error.message);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Ukuran file maksimal 2MB');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('File harus berupa gambar');
                return;
            }

            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadAvatar = async () => {
        if (!avatarFile) return formData.avatar_url;

        try {
            setUploading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not found');

            // Delete old avatar if exists
            if (formData.avatar_url) {
                const oldPath = formData.avatar_url.split('/storage/v1/object/public/events/')[1];
                if (oldPath) {
                    await fetch(`/api/upload?path=${encodeURIComponent(oldPath)}`, {
                        method: 'DELETE',
                    });
                }
            }

            // Use API endpoint to upload (bypasses RLS with service role)
            const uploadFormData = new FormData();
            uploadFormData.append('file', avatarFile);

            const response = await fetch('/api/upload?folder=avatars', {
                method: 'POST',
                body: uploadFormData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Upload failed');
            }

            const { url } = await response.json();
            return url;
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            toast.error('Gagal upload foto');
            throw error;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not found');

            // Upload avatar if changed
            let avatarUrl = formData.avatar_url;
            if (avatarFile) {
                avatarUrl = await uploadAvatar();
            }

            // Update profile
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    phone: formData.phone,
                    institution: formData.institution,
                    position: formData.position,
                    city: formData.city,
                    avatar_url: avatarUrl,
                })
                .eq('id', user.id);

            if (error) throw error;

            toast.success('Profile berhasil diupdate!');
            router.push('/dashboard');
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error(error.message || 'Gagal update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!authChecked) {
        return (
            <>
                <Navbar />
                <EditProfileSkeleton />
            </>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-primary animate-fade-in">
            <Navbar />

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Kembali ke Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Perbarui informasi profil Anda
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className={`px-4 py-2 -mb-px border-b-2 ${activeTab === 'profile' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'} transition-colors`}
                    >
                        Profil
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('security')}
                        className={`px-4 py-2 -mb-px border-b-2 ${activeTab === 'security' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'} transition-colors`}
                    >
                        Keamanan
                    </button>
                </div>

                {activeTab === 'profile' && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar Section */}
                        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md dark:shadow-xl p-6 border border-transparent dark:border-gray-700 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Foto Profile</h2>

                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center ring-4 ring-transparent group-hover:ring-primary-200 dark:group-hover:ring-primary-900/30 transition-all">
                                        {avatarPreview ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={avatarPreview}
                                                alt="Avatar"
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            />
                                        ) : (
                                            <svg className="w-16 h-16 text-gray-400 transition-colors group-hover:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    {avatarPreview && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAvatarFile(null);
                                                setAvatarPreview('');
                                                setFormData({ ...formData, avatar_url: '' });
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 hover:scale-110 transition-all shadow-lg"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <label className="block">
                                        <span className="sr-only">Choose avatar</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="block w-full text-sm text-gray-500 dark:text-gray-400
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-lg file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-primary-50 file:text-primary-700
                                            dark:file:bg-primary-900/30 dark:file:text-primary-400
                                            hover:file:bg-primary-100 dark:hover:file:bg-primary-900/50
                                            file:cursor-pointer cursor-pointer"
                                        />
                                    </label>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        PNG, JPG atau WEBP. Maksimal 2MB.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md dark:shadow-xl p-6 border border-transparent dark:border-gray-700 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Informasi Pribadi</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nama Lengkap <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white dark:bg-dark-secondary text-gray-900 dark:text-white transition-all hover:border-primary-400 dark:hover:border-primary-500"
                                        placeholder="Masukkan nama lengkap"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nomor HP
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white dark:bg-dark-secondary text-gray-900 dark:text-white transition-all hover:border-primary-400 dark:hover:border-primary-500"
                                        placeholder="08xxxxxxxxxx"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Instansi/Perusahaan
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.institution}
                                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white dark:bg-dark-secondary text-gray-900 dark:text-white transition-all hover:border-primary-400 dark:hover:border-primary-500"
                                        placeholder="Nama instansi atau perusahaan"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Jabatan
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white dark:bg-dark-secondary text-gray-900 dark:text-white transition-all hover:border-primary-400 dark:hover:border-primary-500"
                                        placeholder="Posisi/jabatan Anda"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Domisili
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white dark:bg-dark-secondary text-gray-900 dark:text-white transition-all hover:border-primary-400 dark:hover:border-primary-500"
                                        placeholder="Kota tempat tinggal"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="flex-1 bg-primary-600 dark:bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-primary-600 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {loading || uploading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                        {uploading ? 'Mengupload...' : 'Menyimpan...'}
                                    </span>
                                ) : (
                                    'Simpan Perubahan'
                                )}
                            </button>
                            <Link
                                href="/dashboard"
                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all hover:scale-[1.02] text-center"
                            >
                                Batal
                            </Link>
                        </div>
                    </form>
                )}

                {activeTab === 'security' && (
                    <SecuritySection />
                )}
            </div>
        </div>
    );
}

function SecuritySection() {
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const lenOK = newPassword.length >= 8;
    const numOK = /\d/.test(newPassword);

    const validate = () => {
        if (!currentPassword) { toast.error('Masukkan password saat ini'); return false; }
        if (!newPassword) { toast.error('Password baru wajib diisi'); return false; }
        if (!lenOK) { toast.error('Password minimal 8 karakter'); return false; }
        if (!numOK) { toast.error('Password harus mengandung angka'); return false; }
        if (!confirmPassword) { toast.error('Konfirmasi password wajib diisi'); return false; }
        if (newPassword !== confirmPassword) { toast.error('Password tidak sama'); return false; }
        return true;
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);
            const { data: { user }, error: userErr } = await supabase.auth.getUser();
            if (userErr) throw userErr;
            if (!user?.email) throw new Error('User tidak ditemukan');

            // Re-authenticate by verifying current password
            const { error: loginErr } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            });
            if (loginErr) throw new Error('Password saat ini salah');

            // Update password
            const { error: updErr } = await supabase.auth.updateUser({ password: newPassword });
            if (updErr) throw updErr;

            toast.success('Password berhasil diubah');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || 'Gagal mengubah password');
        } finally {
            setLoading(false);
        }
    };

    const handleSendResetLink = async () => {
        try {
            setSending(true);
            const { data: { user }, error: userErr } = await supabase.auth.getUser();
            if (userErr) throw userErr;
            if (!user?.email) throw new Error('User tidak ditemukan');

            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
            const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: `${siteUrl}/auth/callback` });
            if (error) throw error;
            toast.success('Link reset password telah dikirim ke email Anda');
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || 'Gagal mengirim link reset password');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-md dark:shadow-xl p-6 border border-transparent dark:border-gray-700 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Ubah Password</h2>

                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password Saat Ini</label>
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white dark:bg-dark-secondary text-gray-900 dark:text-white" placeholder="••••••••" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password Baru</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white dark:bg-dark-secondary text-gray-900 dark:text-white" placeholder="Minimal 8 karakter & ada angka" />
                        <div className="mt-2 space-y-1 text-xs">
                            <div className={`flex items-center gap-2 ${lenOK ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Minimal 8 karakter
                            </div>
                            <div className={`flex items-center gap-2 ${numOK ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Mengandung angka (0-9)
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Konfirmasi Password Baru</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white dark:bg-dark-secondary text-gray-900 dark:text-white" placeholder="••••••••" />
                    </div>

                    <div className="flex gap-3">
                        <button type="submit" disabled={loading} className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50">
                            {loading ? 'Menyimpan...' : 'Simpan Password'}
                        </button>
                        {/* <button type="button" onClick={handleSendResetLink} disabled={sending} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50">
                            {sending ? 'Mengirim...' : 'Kirim Link Reset via Email'}
                        </button> */}
                    </div>
                </form>
            </div>
            {/* <div className="text-sm text-gray-500 dark:text-gray-400">
                Catatan: Link reset password berguna jika Anda lupa password. Anda akan diarahkan kembali ke aplikasi setelah klik tautan dari email.
            </div> */}
        </div>
    );
}
