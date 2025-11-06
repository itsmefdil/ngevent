# Fix RLS Policy untuk Delete Registrations

## Problem
Count: 0 berarti tidak ada row yang terhapus karena **RLS (Row Level Security) policy** di Supabase tidak mengizinkan DELETE pada tabel `registrations` oleh organizer.

## Solution

### 1. Buka Supabase Dashboard
- Pergi ke: https://supabase.com/dashboard
- Pilih project Anda
- Klik **Authentication** > **Policies**
- Pilih tabel **`registrations`**

### 2. Tambahkan DELETE Policy untuk Organizer

Jalankan SQL berikut di **SQL Editor** Supabase:

```sql
-- Policy: Organizer dapat DELETE registrations dari event mereka sendiri
CREATE POLICY "Organizer can delete registrations from their events"
ON registrations
FOR DELETE
USING (
  event_id IN (
    SELECT id 
    FROM events 
    WHERE organizer_id = auth.uid()
  )
);
```

### 3. Verifikasi Existing Policies

Pastikan Anda juga memiliki policies berikut:

#### SELECT Policy (untuk organizer melihat registrations)
```sql
CREATE POLICY "Organizer can view registrations from their events"
ON registrations
FOR SELECT
USING (
  event_id IN (
    SELECT id 
    FROM events 
    WHERE organizer_id = auth.uid()
  )
);
```

#### UPDATE Policy (untuk organizer update status)
```sql
CREATE POLICY "Organizer can update registrations from their events"
ON registrations
FOR UPDATE
USING (
  event_id IN (
    SELECT id 
    FROM events 
    WHERE organizer_id = auth.uid()
  )
);
```

### 4. Check Current Policies

Untuk melihat semua policies yang ada:

```sql
SELECT * FROM pg_policies WHERE tablename = 'registrations';
```

### 5. Drop Policy (jika ada duplikat atau salah)

```sql
DROP POLICY IF EXISTS "nama_policy_lama" ON registrations;
```

## Testing

Setelah menambahkan policy, coba:
1. Login sebagai organizer
2. Buka halaman registrations dashboard
3. Klik tombol Hapus pada salah satu peserta
4. Console seharusnya menampilkan: `Delete result: { error: null, count: 1 }`
5. Participant berhasil terhapus

## Alternative: Disable RLS (NOT RECOMMENDED untuk production)

Jika ini masih development dan ingin cepat:

```sql
ALTER TABLE registrations DISABLE ROW LEVEL SECURITY;
```

**WARNING**: Ini akan membuat semua user bisa delete semua registrations. Hanya untuk testing!

## Re-enable RLS

```sql
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
```
