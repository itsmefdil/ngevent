# Supabase Database Setup Guide

## Masalah dengan `full_schema.sql`

File `full_schema.sql` mengandung perintah untuk memodifikasi tabel `storage.objects` yang merupakan tabel sistem Supabase. Ketika Anda menjalankan script ini di SQL Editor, Anda akan mendapat error:

```
ERROR: 42501: must be owner of table objects
```

Error ini terjadi karena:
1. Tabel `storage.objects` dimiliki oleh sistem Supabase, bukan oleh user biasa
2. SQL Editor menjalankan query sebagai user authenticated, bukan sebagai database owner
3. Anda tidak memiliki permission untuk mengubah struktur tabel sistem

## Solusi: Gunakan `schema_without_storage.sql`

Saya telah membuat file baru `schema_without_storage.sql` yang **tidak mengandung** storage policies dan dapat dijalankan dengan aman di SQL Editor.

### Langkah-langkah Setup:

#### 1. Jalankan Schema Utama

Di Supabase SQL Editor, jalankan file:
```
schema_without_storage.sql
```

File ini akan membuat:
- ✅ Semua tabel (profiles, events, speakers, registrations, form_fields, notifications, email_templates, email_logs)
- ✅ Semua indexes untuk performa
- ✅ Semua RLS policies
- ✅ Semua functions dan triggers
- ✅ Default email templates

#### 2. Setup Storage Bucket (Manual via Dashboard)

Karena storage policies memerlukan elevated privileges, Anda harus setup storage bucket secara manual:

**A. Buat Bucket:**
1. Buka Supabase Dashboard
2. Pergi ke **Storage** di sidebar
3. Klik **New bucket**
4. Isi:
   - Name: `events`
   - Public bucket: ✅ **Checked** (centang ini)
5. Klik **Create bucket**

**B. Setup Storage Policies:**

Setelah bucket dibuat, klik bucket `events` > **Policies** tab, lalu tambahkan policies berikut:

**Policy 1: Public Read Access**
```sql
CREATE POLICY "Public can view event files"
ON storage.objects FOR SELECT
USING (bucket_id = 'events');
```

**Policy 2: Authenticated Upload**
```sql
CREATE POLICY "Authenticated users can upload event files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'events');
```

**Policy 3: Update Own Files**
```sql
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'events' 
  AND auth.uid() = owner
)
WITH CHECK (
  bucket_id = 'events'
  AND auth.uid() = owner
);
```

**Policy 4: Delete Own Files**
```sql
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'events'
  AND auth.uid() = owner
);
```

## Perbedaan File

### `full_schema.sql` (JANGAN DIGUNAKAN DI SQL EDITOR)
- ❌ Mengandung storage policies
- ❌ Akan error saat dijalankan di SQL Editor
- ✅ Bisa digunakan untuk reference atau migration tools

### `schema_without_storage.sql` (GUNAKAN INI)
- ✅ Tidak mengandung storage policies
- ✅ Aman dijalankan di SQL Editor
- ✅ Membuat semua tabel, functions, dan policies yang diperlukan
- ⚠️ Storage bucket harus di-setup manual via Dashboard

## Verifikasi Setup

Setelah menjalankan `schema_without_storage.sql`, Anda bisa verifikasi dengan query berikut:

```sql
-- Cek semua tabel yang dibuat
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Cek semua RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Cek semua functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

## Troubleshooting

### Error: "relation already exists"
Jika Anda sudah pernah menjalankan schema sebelumnya, Anda bisa:
1. Drop semua tabel terlebih dahulu (HATI-HATI: ini akan menghapus semua data)
2. Atau skip error dan lanjutkan (karena script menggunakan `CREATE TABLE IF NOT EXISTS`)

### Error saat membuat storage policies
Pastikan Anda membuat policies di **Dashboard > Storage > Policies**, bukan di SQL Editor.

### Trigger tidak berfungsi
Pastikan trigger `on_auth_user_created` sudah dibuat. Cek dengan:
```sql
SELECT * FROM pg_trigger WHERE tgname LIKE '%auth_user%';
```

## File Structure

```
supabase/
├── full_schema.sql              # Schema lengkap (jangan digunakan di SQL Editor)
├── schema_without_storage.sql   # Schema tanpa storage policies (GUNAKAN INI)
└── README_SETUP.md             # File ini
```

## Next Steps

Setelah setup database selesai:
1. ✅ Test authentication flow
2. ✅ Test profile creation
3. ✅ Test event creation
4. ✅ Test file upload ke storage bucket
5. ✅ Test notifications
6. ✅ Setup email webhooks (optional)

## Support

Jika masih ada error, silakan check:
- Supabase logs di Dashboard > Logs
- Browser console untuk client-side errors
- Network tab untuk API request/response
