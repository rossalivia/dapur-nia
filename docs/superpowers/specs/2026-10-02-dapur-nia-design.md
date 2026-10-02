# Desain Arsitektur & Spesifikasi Teknis: App 2 Dapur Nia

**Tanggal:** 2026-10-02  
**Status:** Disetujui (Tahap Perancangan Desain)  
**Referensi:** [PRD-App-2-Dapur-Nia.docx.md](../../../PRD-App-2-Dapur-Nia.docx.md) & [Skema-Firestore-Dapur-Nia.docx.md](../../../Skema-Firestore-Dapur-Nia.docx.md)

---

## 1. Ringkasan Eksekutif & Tujuan

Dapur Nia adalah usaha katering harian yang mengalami kendala operasional akibat pencatatan manual: pesanan terlewat, sisa porsi tidak terpantau seketika, kalkulasi tagihan rawan salah, dan pesanan nol porsi tetap tersimpan.

Aplikasi web ini dibangun sebagai solusi terintegrasi untuk mengelola menu, pelanggan, pesanan, dan laporan harian dalam satu alur data berbasis Cloud Firestore. Pada Sesi 3, aplikasi diimplementasikan dalam konteks **satu peran (single role pengelola/admin)** untuk latihan CRUD, penegakan aturan data (*invariants*), dan publikasi ke Netlify.

---

## 2. Fondasi Teknologi & Dependensi

* **Bundler & Framework**: Vite + React 18+ dengan TypeScript.
* **Styling**: Tailwind CSS.
* **Komponen UI**: shadcn/ui (menggunakan preset `b1d9r2Zx7w` dengan template `vite`).
* **Routing**: `react-router-dom` (v6+) untuk navigasi mobile-first yang mendukung deep-linking dan navigasi browser.
* **Basis Data**: Cloud Firestore (Firebase SDK v10+ Web modular).
* **Platform Publikasi**: Netlify (SPA redirect via `_redirects` atau `netlify.toml`).
* **Kredensial**: Variabel lingkungan `.env` (`VITE_FIREBASE_*`) dengan berkas contoh `.env.example` (kunci rahasia tidak pernah di-commit ke Git).

---

## 3. Pola Arsitektur: Modular Feature-Based dengan Service Layer & Custom Hooks

Aplikasi menggunakan pola arsitektur berbasis fitur (*feature-based*), di mana setiap modul fungsional mengisolasi komponen UI, logika Firestore SDK (*service layer*), dan manajemen pemantauan data real-time (*custom hooks*).

### Struktur Direktori Proyek

```text
dapur-nia/
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-10-02-dapur-nia-design.md
├── public/
│   └── _redirects              # Konfigurasi SPA routing untuk Netlify
├── src/
│   ├── components/
│   │   ├── ui/                 # Komponen shadcn/ui (Button, Dialog, Sheet, Card, Badge, Input, Select, dll.)
│   │   ├── layout/
│   │   │   ├── Header.tsx      # Top bar (Logo Dapur Nia, status koneksi, tombol Seed Data)
│   │   │   ├── BottomNav.tsx   # Mobile Bottom Navigation Bar (4 modul)
│   │   │   └── MainLayout.tsx  # Wrapper layout responsif mobile-first
│   │   └── shared/
│   │       ├── EmptyState.tsx   # Tampilan saat data kosong dengan CTA
│   │       ├── LoadingState.tsx # Skeleton loading responsif
│   │       └── ErrorState.tsx   # Penampil galat ramah pengguna
│   ├── features/
│   │   ├── menu/
│   │   │   ├── components/     # MenuList, MenuCard, MenuFormSheet
│   │   │   ├── hooks/          # useMenu (real-time listener onSnapshot)
│   │   │   ├── services/       # menuService.ts (CRUD & validasi stok/harga)
│   │   │   └── types.ts        # Tipe data Menu
│   │   ├── pelanggan/
│   │   │   ├── components/     # PelangganList, PelangganCard, PelangganFormSheet
│   │   │   ├── hooks/          # usePelanggan (real-time listener onSnapshot)
│   │   │   ├── services/       # pelangganService.ts (CRUD & validasi WA unik)
│   │   │   └── types.ts        # Tipe data Pelanggan
│   │   ├── pesanan/
│   │   │   ├── components/     # PesananList, PesananCard, PesananDetailSheet, PesananFormSheet
│   │   │   ├── hooks/          # usePesanan (real-time listener onSnapshot)
│   │   │   ├── services/       # pesananService.ts (transisi status, kalkulasi total, update sisa porsi)
│   │   │   └── types.ts        # Tipe data Pesanan & PesananStatus
│   │   └── laporan/
│   │       ├── components/     # LaporanSummaryCards, PorsiTerjualTable, DatePickerFilter
│   │       ├── hooks/          # useLaporan (agregasi pesanan per tanggal)
│   │       ├── services/       # laporanService.ts
│   │       └── types.ts        # Tipe data Laporan
│   ├── lib/
│   │   ├── firebase.ts         # Inisialisasi Firebase App & db Firestore
│   │   ├── utils.ts            # Utility cn untuk Tailwind CSS
│   │   ├── formatters.ts       # Format Rupiah & tanggal (YYYY-MM-DD)
│   │   └── seedData.ts         # Bantuan demo data awal (menu & pelanggan)
│   ├── App.tsx                 # Routing konfigurasi
│   ├── main.tsx                # Entry point React
│   └── index.css               # Setup Tailwind CSS & styling dasar
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 4. Skema Basis Data & Aturan Firestore

Penamaan koleksi, field, dan tipe data mengikuti **100%** isi [Skema-Firestore-Dapur-Nia.docx.md](../../../Skema-Firestore-Dapur-Nia.docx.md).

### 4.1 Koleksi `menu`
* **ID Dokumen**: Otomatis (*auto-generated ID* oleh Firestore).
* **Deskripsi**: Daftar menu harian, harga, dan sisa porsi.

| Field | Tipe Data | Wajib | Aturan & Keterangan |
| :--- | :--- | :--- | :--- |
| `nama` | string | Ya | 1 sampai 60 karakter |
| `harga` | number (bulat) | Ya | Minimal 0, satuan Rupiah tanpa titik |
| `sisa_porsi` | number (bulat) | Ya | Minimal 0. Nilai 0 ditampilkan sebagai status "Habis" |
| `tersedia` | boolean | Ya | `true` tampil di daftar, `false` disembunyikan |
| `dibuat_pada` | timestamp | Ya | `serverTimestamp()` Firestore |

### 4.2 Koleksi `pelanggan`
* **ID Dokumen**: `no_whatsapp` (Nomor WhatsApp menjadi kunci utama).
* **Deskripsi**: Data pelanggan dan alamat pengiriman. Satu nomor hanya dapat dipakai oleh satu pelanggan.

| Field | Tipe Data | Wajib | Aturan & Keterangan |
| :--- | :--- | :--- | :--- |
| `nama` | string | Ya | 1 sampai 60 karakter |
| `no_whatsapp` | string | Ya | Sama dengan ID dokumen. Diawali `08`, 10 sampai 13 angka |
| `alamat` | string | Ya | Alamat pengiriman, 1 sampai 200 karakter |
| `dibuat_pada` | timestamp | Ya | `serverTimestamp()` Firestore |

### 4.3 Koleksi `pesanan`
* **ID Dokumen**: Otomatis (*auto-generated ID*).
* **Deskripsi**: Satu pesanan berisi tepat satu menu. Data nama pelanggan, alamat, nama menu, dan harga disalin (*snapshot*) agar laporan historis tidak berubah bila master data berubah.

| Field | Tipe Data | Wajib | Aturan & Keterangan |
| :--- | :--- | :--- | :--- |
| `pelanggan_id` | string | Ya | ID dokumen pelanggan (nomor WhatsApp) |
| `nama_pelanggan`| string | Ya | Salinan nama pelanggan saat memesan |
| `alamat_kirim` | string | Ya | Salinan alamat pengiriman saat memesan |
| `menu_id` | string | Ya | ID dokumen menu yang dipesan |
| `nama_menu` | string | Ya | Salinan nama menu saat memesan |
| `harga_satuan` | number (bulat) | Ya | Salinan harga menu per porsi saat memesan |
| `jumlah_porsi` | number (bulat) | Ya | Minimal 1 dan tidak melebihi sisa porsi menu |
| `ongkir` | number (bulat) | Ya | Ongkos kirim, minimal 0 |
| `total` | number (bulat) | Ya | Nilai pasti: `harga_satuan × jumlah_porsi + ongkir` |
| `status` | string | Ya | Status pesanan (lihat alur transisi status) |
| `bukti_bayar` | string | Tidak | Tautan bukti transfer atau catatan bayar (boleh kosong) |
| `tanggal` | string | Ya | Tanggal pesanan, format `YYYY-MM-DD` |
| `dibuat_pada` | timestamp | Ya | `serverTimestamp()` Firestore |

---

## 5. Tiga Invariant Data (Aturan Integritas Baku)

Tiga aturan ini dijamin kebenarannya secara ketat oleh *service layer* dan validasi form:
1. **Invariant 1 (`menu`)**: `harga >= 0` dan `sisa_porsi >= 0`. Tidak pernah bernilai negatif.
2. **Invariant 2 (`pesanan`)**: `jumlah_porsi >= 1` dan `jumlah_porsi <= menu.sisa_porsi`.
3. **Invariant 3 (`pesanan`)**: `total == (harga_satuan × jumlah_porsi) + ongkir`. Dihitung otomatis di antarmuka dan divalidasi ulang di service sebelum penyimpanan.

---

## 6. Mesin Status Pesanan (*State Machine*)

Pesanan baru selalu diinisialisasi dengan status `menunggu_bayar`. Transisi status dikendalikan secara kaku, dilarang melompat (*no skipping*) dan dilarang mundur (*no rollback*):

```text
       [menunggu_bayar]
         │          │
         ▼          ▼
     [dibayar]   [dibatalkan]*
         │          │
         ▼          ▼
     [diproses]  [dibatalkan]*
         │
         ▼
     [selesai]*

* = Status terminal (terkunci, tidak dapat berubah lagi)
```

* **Aturan Transisi**:
  * `menunggu_bayar` $\rightarrow$ hanya dapat berpindah ke `dibayar` ATAU `dibatalkan`.
  * `dibayar` $\rightarrow$ hanya dapat berpindah ke `diproses` ATAU `dibatalkan`.
  * `diproses` $\rightarrow$ hanya dapat berpindah ke `selesai`.
  * `selesai` dan `dibatalkan` $\rightarrow$ status akhir; tidak dapat diubah lagi.
* **Manajemen Porsi Menu Saat Pemesanan / Pembatalan**:
  * Saat pesanan dibuat: `menu.sisa_porsi` berkurang sejumlah `jumlah_porsi`.
  * Jika pesanan dibatalkan sebelum diproses: `menu.sisa_porsi` dikembalikan sejumlah `jumlah_porsi`.

---

## 7. Modul Laporan Harian

* **Koleksi**: Tidak menggunakan koleksi tersendiri; dihitung secara dinamis dari koleksi `pesanan`.
* **Kriteria Query**:
  * Filter berdasarkan field `tanggal` (`tanggal == filterTanggal`).
  * Mengecualikan pesanan yang berstatus `dibatalkan` (`status != 'dibatalkan'`).
* **Kalkulasi**:
  * **Porsi Terjual per Menu**: Agregasi jumlah porsi dari semua pesanan sah pada tanggal tersebut per `nama_menu`.
  * **Total Uang Masuk**: Penjumlahan nilai `total` dari semua pesanan sah pada tanggal tersebut.
* **Status Tampilan**:
  * Jika belum ada pesanan sah pada tanggal tersebut, aplikasi menampilkan `EmptyState` dengan pesan: *"Belum ada pesanan yang tercatat pada tanggal [tanggal terpilih]"*.

---

## 8. Desain Antarmuka & Alur Pengguna (Mobile-First)

### 8.1 Pola Navigasi
* **Layout Responsif**: Wadah konten dioptimalkan untuk lebar ponsel (`max-w-md mx-auto` dengan tampilan rapi di layar desktop).
* **Bottom Navigation Bar (Fixed Bottom)**:
  * 🍲 **Menu** (`/menu`)
  * 👥 **Pelanggan** (`/pelanggan`)
  * 📝 **Pesanan** (`/pesanan`)
  * 📊 **Laporan** (`/laporan`)
* **Pengalihan Default**: Membuka `/` otomatis dialihkan ke `/menu`.

### 8.2 Interaksi & Form
* Penambahan dan pengeditan data menggunakan komponen **Sheet / Drawer** (atau Dialog responsif) dari shadcn/ui.
* Semua label form diletakkan di atas input field.
* Umpan balik galat ditampilkan langsung di bawah input field (*inline error*).
* Tombol aksi menggunakan teks deskriptif hasil: **"Simpan Menu"**, **"Simpan Pelanggan"**, **"Simpan Pesanan"**, **"Konfirmasi Bayar"**, **"Batalkan Pesanan"**.

---

## 9. Rencana Pengujian 6 Masukan Tidak Sah (PRD Poin 8)

| No | Skenario Masukan Tidak Sah | Perilaku Sistem | Validasi UI / Service |
| :--- | :--- | :--- | :--- |
| **1** | **Field Kosong** | Menyimpan menu tanpa nama, atau pelanggan tanpa nama/alamat. | Permintaan ditolak; pesan perbaikan muncul di bawah field terkait. Dokumen tidak tersimpan. |
| **2** | **Tipe Salah** | Memasukkan teks pada input harga, porsi, atau ongkir. | Input hanya menerima angka bulat; validator memeriksa integer valid. |
| **3** | **Teks Terlalu Panjang** | Nama $> 60$ karakter, no WA $> 13$ digit, alamat $> 200$ karakter. | Form menampilkan pesan batas karakter dan mencegah submit. |
| **4** | **Nilai Negatif** | Harga $< 0$, sisa porsi $< 0$, atau ongkir $< 0$. | Melanggar Invariant 1; form memblokir tombol simpan dan service menolak operasi. |
| **5** | **Nilai di Luar Batas** | Porsi pesanan $= 0$ atau porsi $>$ sisa porsi menu. | Melanggar Invariant 2; menampilkan pesan *"Porsi minimal 1 dan tidak boleh melebihi sisa porsi"*. |
| **6** | **Perubahan Status Tidak Sah** | Memaksa status melompat (misal `menunggu_bayar` $\rightarrow$ `selesai`) atau mundur. | UI hanya menampilkan tombol aksi transisi yang diizinkan; service layer melempar galat bila transisi ilegal dipanggil. |

---

## 10. Kesiapan Deployment Netlify

* Berkas `public/_redirects` berisi `/* /index.html 200` untuk mendukung navigasi client-side `react-router-dom` saat di-refresh pada URL publik.
* Script build teruji via `npm run build` menghasilkan bundle di direktori `dist/`.
