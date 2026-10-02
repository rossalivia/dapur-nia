# App 2 Dapur Nia

Aplikasi web manajemen katering harian Dapur Nia, dibangun untuk kebutuhan operasional pencatatan menu, pelanggan, pesanan, dan laporan harian dalam satu alur data terpadu berbasis Cloud Firestore.

## Teknologi yang Digunakan
- **Frontend Framework**: React 18+ (Vite, TypeScript)
- **Styling**: Tailwind CSS
- **Komponen UI**: shadcn/ui (preset `b1d9r2Zx7w`)
- **Routing**: React Router DOM (v7)
- **Basis Data**: Google Cloud Firestore (Firebase SDK v10+)
- **Testing**: Vitest + React Testing Library
- **Platform Publikasi**: Netlify

## Struktur Proyek (Modular Feature-Based)
```text
src/
├── components/
│   ├── layout/       # Header, BottomNav, MainLayout
│   ├── shared/       # EmptyState, LoadingState, ErrorState
│   └── ui/           # Komponen shadcn/ui
├── features/
│   ├── menu/         # CRUD Menu, Sisa Porsi, Invariant 1
│   ├── pelanggan/    # CRUD Pelanggan, WhatsApp Unik
│   ├── pesanan/      # Buat Pesanan, State Machine Transisi Status
│   ├── laporan/      # Rekapitulasi Omset & Porsi Terjual per Tanggal
│   └── verification/ # Rangkaian Uji Tembus 6 Masukan Tidak Sah
├── lib/              # Inisialisasi Firebase, Formatters, Helper Seed
└── types/            # TypeScript Interface Dokumen Firestore
```

## Menjalankan Proyek Secara Lokal

1. Pasang dependensi:
   ```bash
   npm install
   ```

2. Konfigurasi kredensial Firebase:
   Salin `.env.example` menjadi `.env` dan masukkan konfigurasi project Firebase Anda:
   ```bash
   cp .env.example .env
   ```

3. Jalankan server pengembangan lokal:
   ```bash
   npm run dev
   ```

4. Jalankan pengujian otomatis (Unit & Integration Tests):
   ```bash
   npm test
   ```

5. Build untuk produksi (Netlify):
   ```bash
   npm run build
   ```

## Tiga Invariant Data
1. `harga` dan `sisa_porsi` di koleksi `menu` tidak pernah bernilai negatif.
2. `jumlah_porsi` di `pesanan` minimal 1 dan tidak melebihi `sisa_porsi` menu.
3. `total` tagihan pesanan selalu bernilai tepat `(harga_satuan * jumlah_porsi) + ongkir`.
