# Desain Arsitektur & Spesifikasi Teknis: Fitur Login & Daftar Akun Dapur Nia

**Tanggal:** 2026-10-09  
**Status:** Draf Perancangan (Menunggu Tinjauan Pengguna)  
**Referensi:** [PRD-App-2-Dapur-Nia.docx.md](../../../PRD-App-2-Dapur-Nia.docx.md) & [Skema-Firestore-Dapur-Nia.docx.md](../../../Skema-Firestore-Dapur-Nia.docx.md)

---

## 1. Ringkasan Eksekutif & Tujuan

Fitur ini melengkapi aplikasi Dapur Nia dengan subsistem **Autentikasi & Otorisasi Pengguna** berbasis **Firebase Authentication**, membagi pengalaman pengguna ke dalam dua peran sesuai arahan PRD:
1. **👑 Admin (Pemilik/Staf - Dina & Rani):** Memiliki akses penuh ke seluruh modul operasional katering: CRUD Menu, Data Pelanggan, Pengelolaan Semua Pesanan, dan Laporan Keuangan Harian.
2. **👤 Pelanggan (Umum):** Dapat mendaftarkan akun baru, masuk, melihat menu yang tersedia, melakukan pemesanan (dengan data nama, nomor WhatsApp, dan alamat yang otomatis terisi dari profil), serta memantau riwayat pesanannya sendiri.

Implementasi ini dirancang agar **100% selaras dengan PRD Sesi 3 dan Skema Firestore**:
- Tetap mematuhi 3 koleksi inti (`menu`, `pelanggan`, `pesanan`).
- Tidak mengubah konvensi penamaan field, aturan validasi, atau *invariants* yang telah ditetapkan mentor.

---

## 2. Fondasi Autentikasi & Model Data

### 2.1 Firebase Authentication
- **Provider:** Email & Password menggunakan SDK modular Firebase (`firebase/auth`).
- Diinisialisasi di `src/lib/firebase.ts`:
  ```ts
  import { getAuth, Auth } from 'firebase/auth';
  export const auth: Auth = getAuth(app);
  ```

### 2.2 Penentuan Peran (Role Mapping)
Untuk mematuhi aturan PRD agar tidak menambah koleksi database di luar kesepakatan:
- **Admin/Pengelola:** Diidentifikasi melalui daftar email admin (misal `admin@dapurnia.com` atau nilai environment `VITE_ADMIN_EMAILS` dengan fallback default `admin@dapurnia.com`).
- **Pelanggan:** Setiap pendaftaran baru melalui form registrasi dicatat sebagai akun pelanggan. Profilnya disimpan langsung di dokumen koleksi `pelanggan/{no_whatsapp}` sesuai skema Firestore Dapur Nia.

### 2.3 Skema Dokumen Pelanggan
Dokumen pada koleksi `pelanggan` tetap mempertahankan format resmi:
```ts
export interface Pelanggan {
  id?: string;          // sama persis dengan no_whatsapp
  nama: string;         // 1 sampai 60 karakter
  no_whatsapp: string;  // diawali 08, 10-13 digit
  alamat: string;       // 1 sampai 200 karakter
  email?: string;       // email akun auth
  dibuat_pada?: any;
}
```

---

## 3. Struktur Modul & Komponen

Fitur ditempatkan secara modular di dalam direktori `src/features/auth/`:

```text
src/
├── features/
│   ├── auth/
│   │   ├── context/
│   │   │   └── AuthContext.tsx    # Penyedia state user, role, profile, login/logout
│   │   ├── hooks/
│   │   │   └── useAuth.ts         # Hook untuk konsumsi context
│   │   ├── services/
│   │   │   └── authService.ts     # Firebase Auth wrapper (signIn, signUp, signOut, syncPelanggan)
│   │   ├── components/
│   │   │   ├── LoginPage.tsx      # Halaman Login
│   │   │   ├── RegisterPage.tsx   # Halaman Pendaftaran Pelanggan
│   │   │   └── ProtectedRoute.tsx # Guard rute berdasarkan status login & role
│   │   └── types.ts               # Tipe data UserRole, AuthUser, RegisterDTO
```

---

## 4. Alur Autentikasi & Pengalaman Pengguna (UX)

### 4.1 Halaman Masuk (`/login`)
- **Input:** Email dan Kata Sandi.
- **Validasi:** Format email valid, kata sandi minimal 6 karakter.
- **Fitur Tambahan:**
  - Opsi "Demo Akun" / petunjuk kredensial untuk mempermudah penilaian dan pengujian mentor/peserta (misal tombol cepat untuk mengisi demo Admin `admin@dapurnia.com` atau demo Pelanggan).
  - Tautan menuju halaman pendaftaran bagi pelanggan baru.
- **Aksi Pasca Login:**
  - Jika masuk sebagai **Admin** ➔ diarahkan ke `/menu` (Dashboard Pengelola).
  - Jika masuk sebagai **Pelanggan** ➔ diarahkan ke `/menu` (Katalog Menu & Pesan).

### 4.2 Halaman Pendaftaran (`/register`)
- **Input:**
  - Nama Lengkap (1–60 karakter)
  - Nomor WhatsApp (diawali `08`, 10–13 angka)
  - Alamat Lengkap Pengiriman (1–200 karakter)
  - Email (format email valid)
  - Kata Sandi (minimal 6 karakter)
  - Konfirmasi Kata Sandi
- **Validasi Klien:**
  - Pengecekan kesesuaian kata sandi.
  - Pengecekan aturan `08` dan panjang karakter sesuai PRD sebelum data dikirim ke Firebase.
- **Proses:**
  1. `createUserWithEmailAndPassword(auth, email, password)`
  2. Simpan/perbarui profil pelanggan di dokumen Firestore `pelanggan/{no_whatsapp}`.
  3. Pengguna otomatis terautentikasi dan diarahkan ke halaman menu dengan status Pelanggan.

### 4.3 Navigasi Dinamis Berdasarkan Peran
- **Header:**
  - Menampilkan nama pengguna yang sedang aktif dan lencana status peran: `👑 Pengelola` atau `👤 Pelanggan`.
  - Tombol **Keluar (Logout)** dengan dialog konfirmasi.
- **Bottom Navigation Bar:**
  - **Tampilan Admin:** Memiliki 4 tab operasional penuh:
    1. Menu (`/menu`)
    2. Pelanggan (`/pelanggan`)
    3. Pesanan (`/pesanan`)
    4. Laporan (`/laporan`)
  - **Tampilan Pelanggan:** Memiliki 2 tab yang relevan:
    1. Menu & Pesan (`/menu`)
    2. Pesanan Saya (`/pesanan-saya`) - menampilkan daftar pesanan yang dilakukan oleh nomor WhatsApp pelanggan tersebut.

---

## 5. Keamanan Rute & Penanganan Galat

### 5.1 Proteksi Rute (`ProtectedRoute`)
- Rute tanpa autentikasi (tamu) yang mencoba mengakses area terproteksi akan dialihkan ke `/login`.
- Pelanggan yang mencoba mengakses `/laporan` atau `/pelanggan` akan dialihkan kembali ke `/menu` dengan notifikasi hak akses terbatas.

### 5.2 Pemetaan Pesan Galat Ramah Pengguna
Setiap kode kesalahan dari Firebase Authentication diterjemahkan ke bahasa Indonesia tanpa mengekspos rincian teknis mentah:
- `auth/invalid-credential` / `auth/wrong-password` / `auth/user-not-found`: *"Email atau kata sandi yang Anda masukkan salah."*
- `auth/email-already-in-use`: *"Email ini sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda."*
- `auth/weak-password`: *"Kata sandi minimal harus terdiri dari 6 karakter."*
- `auth/network-request-failed`: *"Koneksi internet bermasalah. Periksa jaringan Anda dan coba lagi."*

---

## 6. Rencana Pengujian (Testing Strategy)

1. **Uji Validasi Form (Unit Test):**
   - Validasi email kosong/tidak valid.
   - Validasi nomor WhatsApp (harus diawali 08, panjang 10-13 digit).
   - Validasi kata sandi tidak cocok.
2. **Uji Alur Peran (Integration Test):**
   - Pengguna dengan email admin mendapatkan role `'admin'` dan akses 4 menu.
   - Pengguna baru mendaftar mendapatkan role `'pelanggan'` dan profil tersimpan di Firestore.
   - Pengguna logout membersihkan sesi dan kembali ke `/login`.
