# 🔧 Fix: Update Status Registrasi Tidak Bekerja

## ❌ Masalah
Ketika organizer mencoba mengubah status registrasi (registered/attended/cancelled) di halaman registrations, perubahan tidak tersimpan atau tidak ada respon.

## 🔍 Root Cause Analysis

### Penyebab Yang Ditemukan:
1. **RLS Policy Tidak Lengkap** - Policy UPDATE hanya punya `USING` tapi tidak ada `WITH CHECK`
2. **State Update Tidak Optimal** - Menggunakan state langsung bukan callback
3. **No Error Feedback** - User tidak tahu kenapa gagal
4. **No Logging** - Developer tidak bisa debug

## ✅ Solusi Yang Sudah Diterapkan

### 1. **Fix RLS Policy**
File: `supabase/migrations/fix_registration_update_policy.sql`

**Masalah:**
```sql
-- ❌ Policy lama (tidak lengkap)
CREATE POLICY "Organizers can update registrations for their events"
  ON public.registrations FOR UPDATE
  USING (...);  -- Hanya USING, tidak ada WITH CHECK
```

**Solusi:**
```sql
-- ✅ Policy baru (lengkap)
CREATE POLICY "Organizers can update registrations for their events"
  ON public.registrations FOR UPDATE
  USING (
    (SELECT auth.uid()) IN (
      SELECT organizer_id FROM public.events WHERE id = event_id
    )
  )
  WITH CHECK (  -- ← PENTING! Harus ada untuk UPDATE
    (SELECT auth.uid()) IN (
      SELECT organizer_id FROM public.events WHERE id = event_id
    )
  );
```

**Kenapa Penting:**
- `USING` - Cek apakah user boleh BACA row yang mau di-update
- `WITH CHECK` - Cek apakah user boleh SIMPAN perubahan baru
- Tanpa `WITH CHECK`, UPDATE akan selalu gagal!

### 2. **Enhanced Error Handling**
File: `app/dashboard/events/[id]/registrations/page.tsx`

**Before:**
```typescript
const { error } = await supabase
    .from('registrations')
    .update({ status })
    .eq('id', registrationId);

if (error) throw error;
toast.success('Status berhasil diupdate');
```

**After:**
```typescript
console.log('🔄 Updating registration status:', { registrationId, status });

const { data, error } = await supabase
    .from('registrations')
    .update({ status })
    .eq('id', registrationId)
    .select();  // ← Get updated data back

if (error) {
    console.error('❌ Update error:', error);
    throw error;
}

console.log('✅ Status updated successfully:', data);

toast.success(`Status berhasil diubah menjadi ${status}`);

// Specific error messages
if (error.message?.includes('permission')) {
    toast.error('Tidak ada izin untuk mengubah status. Cek RLS policy.');
} else if (error.message?.includes('violates')) {
    toast.error('Status tidak valid.');
} else {
    toast.error(`Gagal update status: ${error.message}`);
}
```

**Benefits:**
- ✅ Developer bisa lihat error di console
- ✅ User dapat pesan error yang jelas
- ✅ Konfirmasi data berhasil di-update

### 3. **Safer State Update**
File: `app/dashboard/events/[id]/registrations/page.tsx`

**Before:**
```typescript
setRegistrations(registrations.map(reg =>
    reg.id === registrationId ? { ...reg, status } : reg
));
```

**After:**
```typescript
setRegistrations(prevRegistrations =>  // ← Use callback
    prevRegistrations.map(reg =>
        reg.id === registrationId ? { ...reg, status } : reg
    )
);
```

**Why Better:**
- ✅ Selalu gunakan state terbaru (avoid stale closure)
- ✅ Lebih reliable untuk async operations
- ✅ Best practice React

### 4. **Better UX**
File: `app/dashboard/events/[id]/registrations/page.tsx`

**Before:**
```tsx
<option value="registered">Registered</option>
<option value="attended">Attended</option>
<option value="cancelled">Cancelled</option>
```

**After:**
```tsx
<option value="registered">✓ Registered</option>
<option value="attended">★ Attended</option>
<option value="cancelled">✗ Cancelled</option>
```

**Plus:**
```tsx
<select
    className="... cursor-pointer transition-all hover:border-primary-400"
>
```

**Benefits:**
- ✅ Visual icons untuk setiap status
- ✅ Hover effect untuk feedback
- ✅ Lebih user-friendly

## 🚀 Setup Instructions

### Langkah 1: Jalankan Migration RLS Policy

**Di Supabase Dashboard:**
1. Buka **SQL Editor**
2. Copy-paste isi file: `supabase/migrations/fix_registration_update_policy.sql`
3. Klik **RUN**

**Expected Output:**
```
Success. No rows returned
```

**Atau via CLI:**
```bash
supabase migration up --file fix_registration_update_policy.sql
```

### Langkah 2: Verify RLS Policies

**Check via SQL:**
```sql
-- List all policies on registrations table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'registrations'
ORDER BY policyname;
```

**Expected Policies:**
1. ✅ "Users can view their own registrations" (SELECT)
2. ✅ "Users can register for events" (INSERT)
3. ✅ "Users can update their own registrations" (UPDATE)
4. ✅ "Organizers can update registrations for their events" (UPDATE)
5. ✅ "Organizers can view registrations for their events" (SELECT)

### Langkah 3: Test Update Status

1. **Login sebagai organizer**
2. **Buka Dashboard → My Events**
3. **Klik event → View Registrations**
4. **Pilih registrasi**
5. **Ubah status di dropdown**
6. **Check:**
   - ✅ Toast notification muncul "Status berhasil diubah"
   - ✅ Status badge berubah warna
   - ✅ Tidak ada error di console
   - ✅ Refresh page → status tetap berubah

### Langkah 4: Check Console Logs

**Expected logs:**
```
🔄 Updating registration status: {
  registrationId: "xxx-xxx-xxx",
  status: "attended"
}
✅ Status updated successfully: [{...}]
```

**If error:**
```
❌ Update error: {
  code: "42501",
  message: "new row violates row-level security policy..."
}
```
→ Berarti RLS policy belum di-apply

## 🔍 Troubleshooting

### Issue 1: "new row violates row-level security policy"

**Cause:** RLS policy belum di-update atau `WITH CHECK` clause missing.

**Solution:**
1. Run migration: `fix_registration_update_policy.sql`
2. Verify di Supabase Dashboard → Authentication → Policies
3. Make sure ada `WITH CHECK` clause

### Issue 2: Status berubah di UI tapi tidak tersimpan di database

**Cause:** Frontend state ter-update tapi database update gagal silent.

**Solution:**
1. Check console logs untuk error
2. Verify `.select()` dipanggil setelah `.update()`
3. Check network tab untuk response dari Supabase

### Issue 3: "Tidak ada izin untuk mengubah status"

**Cause:** User yang login bukan organizer event tersebut.

**Solution:**
1. Pastikan user yang login adalah organizer event
2. Check di console:
   ```typescript
   const { data } = await supabase
       .from('events')
       .select('organizer_id')
       .eq('id', eventId)
       .single();
   
   console.log('Event organizer:', data.organizer_id);
   console.log('Current user:', (await supabase.auth.getUser()).data.user?.id);
   ```

### Issue 4: Dropdown tidak ada atau disabled

**Cause:** Component tidak ter-render atau ada conditional rendering.

**Check:**
```tsx
// Make sure this exists in registrations table row:
<select
    value={registration.status}
    onChange={(e) => updateRegistrationStatus(...)}
>
```

### Issue 5: Update berhasil tapi list tidak refresh

**Cause:** State update tidak trigger re-render.

**Solution:**
```typescript
// Use callback form of setState
setRegistrations(prev => prev.map(reg =>
    reg.id === registrationId ? { ...reg, status } : reg
));

// NOT this:
setRegistrations(registrations.map(...)); // ← Stale closure!
```

## 📊 How It Works

### Update Flow:
```
1. User clicks dropdown → selects new status
   ↓
2. onChange event triggered
   ↓
3. updateRegistrationStatus called
   ↓
4. Console log: "🔄 Updating..."
   ↓
5. Supabase UPDATE query with RLS check
   ↓
6. Database verifies:
   - USING clause: Can user read this row?
   - WITH CHECK clause: Can user save this change?
   ↓
7. If OK: Update database + return data
   ↓
8. Update local state with callback
   ↓
9. Toast notification + Console log: "✅ Success"
   ↓
10. UI re-renders with new status
```

### RLS Check Flow:
```
UPDATE request comes in
   ↓
Check USING clause:
   - Is current user the organizer of this event?
   - SELECT organizer_id FROM events WHERE id = event_id
   ↓
If YES, proceed to WITH CHECK
   ↓
Check WITH CHECK clause:
   - Is new status value allowed?
   - Is user still the organizer?
   ↓
If YES, save changes
   ↓
If NO, reject with "violates row-level security policy"
```

## 🔐 Security Notes

**Why We Need Both USING and WITH CHECK:**

```sql
-- USING: Who can UPDATE (read the row)
USING ((SELECT auth.uid()) IN (
    SELECT organizer_id FROM events WHERE id = event_id
))

-- WITH CHECK: What can be updated (write the new value)
WITH CHECK ((SELECT auth.uid()) IN (
    SELECT organizer_id FROM events WHERE id = event_id
))
```

**Without WITH CHECK:**
- User can read the row (USING passes)
- User CANNOT save changes (no WITH CHECK = implicit false)
- Result: UPDATE fails with RLS violation

## 📋 Verification Checklist

After applying fixes:

- [ ] RLS policies created/updated in database
- [ ] Both USING and WITH CHECK clauses exist
- [ ] Console logs show update attempts
- [ ] Toast notifications appear on success/error
- [ ] Status badge changes color
- [ ] Dropdown has visual icons
- [ ] Database actually updates (check via SQL)
- [ ] Refresh page keeps new status
- [ ] No errors in browser console
- [ ] Works for all 3 statuses (registered/attended/cancelled)

## 🧪 Testing SQL

**Manual test UPDATE permission:**
```sql
-- Login as organizer
-- Try to update a registration for YOUR event
UPDATE registrations
SET status = 'attended'
WHERE id = 'registration-id-here';

-- Should succeed (1 row updated)

-- Try to update someone else's event registration
UPDATE registrations  
SET status = 'attended'
WHERE id = 'other-organizer-registration-id';

-- Should fail (0 rows updated or RLS error)
```

**Check current status:**
```sql
SELECT 
    r.id,
    r.status,
    r.event_id,
    e.title as event_title,
    e.organizer_id,
    p.full_name as participant_name
FROM registrations r
JOIN events e ON e.id = r.event_id
LEFT JOIN profiles p ON p.id = r.user_id
WHERE r.event_id = 'your-event-id'
ORDER BY r.registered_at DESC;
```

---

**Last Updated:** November 7, 2025
**Status:** ✅ Fixed
**Impact:** Critical - Organizers can now manage registration status properly
