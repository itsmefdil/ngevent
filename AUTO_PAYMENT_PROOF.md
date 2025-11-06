# 💰 Auto Payment Proof Upload Feature

## ✨ Fitur Baru: Auto-Generate Form Bukti Pembayaran

Sistem sekarang akan **otomatis menambahkan form upload bukti pembayaran** saat ada registration fee pada event.

---

## 🎯 Cara Kerja

### **Create Event Page**

1. **Masukkan Registration Fee** (contoh: Rp 50000)
2. **Field "Bukti Pembayaran" otomatis muncul** di tab Registration Form
3. Field type: `file` (untuk upload gambar/PDF)
4. Field ditandai sebagai `required`

### **Edit Event Page**

1. **Tambahkan Registration Fee** → Field upload otomatis ditambahkan
2. **Hapus/kosongkan Registration Fee** → Field upload otomatis dihapus
3. Jika field sudah ada di database, akan di-mark untuk deletion

---

## 📋 Detail Implementasi

### **Logic Flow:**

```
Registration Fee > 0
  ↓
  Cek: Apakah field "Bukti Pembayaran" sudah ada?
  ↓
  TIDAK → Tambahkan field baru dengan:
    - field_name: "Bukti Pembayaran"
    - field_type: "file"
    - is_required: true
  ↓
  Toast notification: "Form upload bukti pembayaran ditambahkan otomatis"

Registration Fee = 0 atau kosong
  ↓
  Cek: Apakah field "Bukti Pembayaran" ada?
  ↓
  YA → Hapus field tersebut
  ↓
  (Untuk edit: Mark field ID untuk deletion dari database)
```

---

## 🔍 Detection Keywords

Field akan dianggap sebagai "payment proof field" jika nama field mengandung:

- "bukti pembayaran" (case insensitive)
- "payment proof" (case insensitive)

Ini memungkinkan fleksibilitas untuk bahasa Indonesia atau Inggris.

---

## 💡 Use Cases

### **Scenario 1: Event Gratis**
```
Registration Fee: 0 atau kosong
→ Tidak ada field bukti pembayaran
→ Peserta langsung register tanpa upload
```

### **Scenario 2: Event Berbayar**
```
Registration Fee: Rp 50000
→ Field "Bukti Pembayaran" muncul otomatis
→ Peserta harus upload bukti transfer saat register
→ Organizer bisa verifikasi pembayaran
```

### **Scenario 3: Event Berubah Gratis → Berbayar**
```
Edit event: Fee 0 → Rp 25000
→ Field upload otomatis ditambahkan
→ Toast notification muncul
```

### **Scenario 4: Event Berubah Berbayar → Gratis**
```
Edit event: Rp 25000 → 0
→ Field upload otomatis dihapus
→ Database cleanup dilakukan
```

---

## 🎨 User Experience

### **Create Event:**

1. User mengisi form event
2. Di tab "Basic Info", user input Registration Fee
3. **Auto-notification** muncul: "Form upload bukti pembayaran ditambahkan otomatis"
4. User pindah ke tab "Registration Form"
5. Field "Bukti Pembayaran" sudah ada di list
6. User bisa edit/customize field jika perlu
7. Save event

### **Edit Event:**

1. User buka event untuk edit
2. User ubah Registration Fee dari 0 ke Rp 50000
3. **Auto-notification** muncul
4. Field muncul di tab Registration Form
5. Save changes

---

## 🔧 Technical Details

### **Files Modified:**

1. **`app/dashboard/events/create/page.tsx`**
   - Added `useEffect` hook untuk monitor `registration_fee`
   - Auto-add payment proof field
   - Toast notification

2. **`app/dashboard/events/[id]/edit/page.tsx`**
   - Added `useEffect` hook dengan dependency `loadingData`
   - Auto-add/remove payment proof field
   - Handle database deletion untuk field yang sudah ada

### **Key Code:**

```typescript
useEffect(() => {
    const hasFee = formData.registration_fee && parseFloat(formData.registration_fee) > 0;
    const hasPaymentProofField = formFields.some(field => 
        field.field_name.toLowerCase().includes('bukti pembayaran') || 
        field.field_name.toLowerCase().includes('payment proof')
    );

    if (hasFee && !hasPaymentProofField) {
        // Add field
        setFormFields(prev => [...prev, {
            field_name: 'Bukti Pembayaran',
            field_type: 'file',
            is_required: true,
            options: null,
        }]);
        toast.success('Form upload bukti pembayaran ditambahkan otomatis');
    } else if (!hasFee && hasPaymentProofField) {
        // Remove field
        setFormFields(prev => prev.filter(field => 
            !field.field_name.toLowerCase().includes('bukti pembayaran')
        ));
    }
}, [formData.registration_fee]);
```

---

## 📝 Field Properties

Auto-generated field memiliki properties:

| Property | Value | Description |
|----------|-------|-------------|
| `field_name` | "Bukti Pembayaran" | Nama field yang tampil |
| `field_type` | "file" | Tipe input = file upload |
| `is_required` | `true` | Field wajib diisi |
| `options` | `null` | Tidak ada options untuk file |

---

## ✅ Benefits

1. **Otomatis** - Organizer tidak perlu manual tambah field
2. **Konsisten** - Semua event berbayar pasti ada field upload
3. **Smart** - Auto-remove jika event jadi gratis
4. **Flexible** - Organizer masih bisa edit field sesuai kebutuhan
5. **User-friendly** - Toast notification kasih feedback jelas

---

## 🎯 Future Enhancements

Possible improvements:

1. **Custom field name** - Setting di form untuk custom nama field
2. **Multiple payment methods** - Support berbagai metode pembayaran
3. **Auto-validation** - Validate format file (JPG/PNG/PDF only)
4. **Payment gateway integration** - Direct payment via Midtrans/Xendit
5. **Auto-approval** - OCR untuk detect bukti pembayaran valid

---

## 🧪 Testing Checklist

- [ ] Create event gratis → No payment field
- [ ] Create event berbayar → Payment field auto-added
- [ ] Edit event: Gratis → Berbayar → Field muncul
- [ ] Edit event: Berbayar → Gratis → Field hilang
- [ ] Save event → Field tersimpan di database
- [ ] Peserta register event berbayar → Harus upload bukti
- [ ] Toast notification muncul saat field ditambahkan

---

## 📚 Related Files

- `/app/dashboard/events/create/page.tsx` - Create event logic
- `/app/dashboard/events/[id]/edit/page.tsx` - Edit event logic
- `/lib/database.types.ts` - Database types
- Database table: `form_fields` - Store registration form fields

---

**Status:** ✅ **IMPLEMENTED & READY TO USE**

Fitur sekarang aktif di halaman Create Event dan Edit Event! 🎉
