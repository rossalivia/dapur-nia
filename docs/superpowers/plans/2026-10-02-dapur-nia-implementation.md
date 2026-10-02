# App 2 Dapur Nia Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun aplikasi web katering Dapur Nia berbasis mobile-first menggunakan React, TypeScript, Tailwind CSS, shadcn/ui, dan Cloud Firestore untuk mengelola menu, pelanggan, pesanan, dan laporan harian dalam satu peran operasional.

**Architecture:** Pendekatan Modular Feature-Based dengan Service Layer & Custom Hooks. Setiap modul (`menu`, `pelanggan`, `pesanan`, `laporan`) mengisolasi komponen UI, logika Firestore SDK dengan penegakan 3 Invariant, dan listener real-time (`onSnapshot`). Antarmuka dinavigasi melalui Mobile Bottom Navigation Bar terintegrasi dengan React Router.

**Tech Stack:** Vite, React 18+, TypeScript, Tailwind CSS, shadcn/ui (preset `b1d9r2Zx7w`), `react-router-dom`, Firebase SDK v10+ (Cloud Firestore), Vitest, React Testing Library.

**Spec:** [`docs/superpowers/specs/2026-10-02-dapur-nia-design.md`](file:///c:/Users/ASUS/Documents/Bootcamp%20Web%20Pro%20PLAN/dapur-nia/dapur-nia/docs/superpowers/specs/2026-10-02-dapur-nia-design.md)

---

## Global Constraints

- Nama koleksi Firestore tepat 3: `menu`, `pelanggan`, `pesanan` (semua huruf kecil bentuk tunggal).
- Nama field tepat snake_case sesuai [Skema-Firestore-Dapur-Nia.docx.md](../../../Skema-Firestore-Dapur-Nia.docx.md) (`sisa_porsi`, `no_whatsapp`, `harga_satuan`, dll.).
- Nilai uang berupa angka bulat integer Rupiah (tanpa titik).
- Format tanggal pesanan adalah teks string `YYYY-MM-DD`.
- ID dokumen koleksi `pelanggan` wajib sama persis dengan `no_whatsapp`.
- 1 pesanan berisi tepat 1 menu dengan snapshot `nama_pelanggan`, `alamat_kirim`, `nama_menu`, dan `harga_satuan`.
- Invariant 1: `harga >= 0` dan `sisa_porsi >= 0` pada `menu`.
- Invariant 2: `jumlah_porsi >= 1` dan `jumlah_porsi <= menu.sisa_porsi` pada `pesanan`.
- Invariant 3: `total == (harga_satuan * jumlah_porsi) + ongkir` pada `pesanan`.
- Transisi status strictly: `menunggu_bayar` -> `dibayar` | `dibatalkan`, `dibayar` -> `diproses` | `dibatalkan`, `diproses` -> `selesai`.
- Kredensial Firebase tidak boleh disimpan di Git; gunakan `.env` dan sediakan `.env.example`.
- Siapkan `public/_redirects` untuk deployment Netlify.

---

## Review Focus

1. **Input angka negatif atau teks desimal pada porsi/harga:** Memastikan form dan service layer menolak input desimal atau bernilai minus.
2. **Porsi pesanan melampaui sisa stok menu terkini:** Memastikan saat membuat pesanan, porsi yang diminta tidak melebihi sisa stok aktual dan stok berkurang secara konsisten.
3. **Penyimpanan nomor WhatsApp ganda:** Memastikan pelanggan baru dengan nomor WhatsApp yang sudah terdaftar ditolak dengan pesan yang informatif.
4. **Upaya transisi status ilegal (melompat atau mundur):** Memastikan hanya transisi sah yang dapat dieksekusi baik melalui UI maupun pemanggilan service.
5. **Agregasi laporan pada tanggal tanpa data atau seluruh pesanan dibatalkan:** Memastikan kalkulasi tidak error, pesanan batal diabaikan, dan menampilkan Empty State yang ramah.

---

### Task 1: Scaffolding Proyek & Inisialisasi Toolchain

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `components.json`
- Create: `src/App.tsx`, `src/main.tsx`, `src/index.css`
- Test: `src/App.test.tsx`

**Interfaces:**
- Produces: Project root runnable via `npm run dev`, testable via `npm test`, styled with Tailwind and shadcn/ui baseline.

- [ ] **Step 1: Write initial test for App mounting**
```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders root layout correctly', () => {
    render(<App />);
    expect(screen.getByText(/Dapur Nia/i)).toBeInTheDocument();
  });
});
```
- [ ] **Step 2: Run test to verify failure**
Run: `npm test`
Expected: FAIL (no test runner or App component yet).
- [ ] **Step 3: Initialize Vite React TypeScript project, Tailwind CSS, Vitest, and shadcn/ui preset**
Inisialisasi project Vite React TypeScript, pasang dependensi `react-router-dom`, `lucide-react`, `firebase`, serta jalankan preset `npx shadcn@latest init --preset b1d9r2Zx7w --template vite`.
- [ ] **Step 4: Run test to verify it passes**
Run: `npm test`
Expected: PASS.
- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "chore: initialize vite react ts project with tailwind and shadcn"
```

---

### Task 2: Setup Firebase, Types, Formatter, & Seeding Helper

**Files:**
- Create: `.env.example`, `.env`
- Create: `src/lib/firebase.ts`
- Create: `src/lib/formatters.ts`
- Create: `src/lib/seedData.ts`
- Create: `src/types/index.ts`
- Test: `src/lib/formatters.test.ts`

**Interfaces:**
- Produces:
  - `export const db = getFirestore(app);`
  - `formatRupiah(amount: number): string`
  - `formatDate(date: string | Date): string`
  - Types: `Menu`, `Pelanggan`, `Pesanan`, `PesananStatus`, `LaporanHarian`
  - `seedInitialData(db: Firestore): Promise<void>`

- [ ] **Step 1: Write unit tests for formatters and validation helpers**
```typescript
import { describe, it, expect } from 'vitest';
import { formatRupiah, validateWhatsApp } from './formatters';

describe('formatters and validators', () => {
  it('formats number into clean Rupiah string', () => {
    expect(formatRupiah(25000)).toBe('Rp 25.000');
    expect(formatRupiah(0)).toBe('Rp 0');
  });

  it('validates WhatsApp number format strictly', () => {
    expect(validateWhatsApp('081234567890')).toBe(true);
    expect(validateWhatsApp('07123456789')).toBe(false); // must start with 08
    expect(validateWhatsApp('08123')).toBe(false); // too short (< 10)
  });
});
```
- [ ] **Step 2: Run test to verify it fails**
Run: `npm test src/lib/formatters.test.ts`
Expected: FAIL with missing functions.
- [ ] **Step 3: Implement types, formatters, firebase initialization, and seed data**
Buat `src/types/index.ts` dengan interface `Menu`, `Pelanggan`, `Pesanan`, implementasikan fungsi `formatRupiah` dan `validateWhatsApp` di `src/lib/formatters.ts`, konfigurasi `src/lib/firebase.ts`, dan skrip seeding di `src/lib/seedData.ts`.
- [ ] **Step 4: Run test to verify it passes**
Run: `npm test src/lib/formatters.test.ts`
Expected: PASS.
- [ ] **Step 5: Commit**
```bash
git add src/types/ src/lib/ .env.example
git commit -m "feat: setup firebase config, types, formatters, and seed data helper"
```

---

### Task 3: Modul Menu (Service, Hook, Komponen CRUD, & Validasi Invariant 1)

**Files:**
- Create: `src/features/menu/services/menuService.ts`
- Create: `src/features/menu/hooks/useMenu.ts`
- Create: `src/features/menu/components/MenuCard.tsx`
- Create: `src/features/menu/components/MenuList.tsx`
- Create: `src/features/menu/components/MenuFormSheet.tsx`
- Create: `src/features/menu/index.tsx`
- Test: `src/features/menu/services/menuService.test.ts`

**Interfaces:**
- Consumes: `db` from `src/lib/firebase.ts`, `Menu` from `src/types/index.ts`
- Produces:
  - `menuService.getAllMenus(): Promise<Menu[]>`
  - `menuService.addMenu(menu: Omit<Menu, 'id'>): Promise<string>`
  - `menuService.updateMenu(id: string, menu: Partial<Menu>): Promise<void>`
  - `menuService.deleteMenu(id: string): Promise<void>`
  - `useMenu(): { menus: Menu[], loading: boolean, error: string | null }`
  - `<MenuFeature />` component for `/menu`

- [ ] **Step 1: Write test for Invariant 1 in menuService**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { validateMenuInput } from './menuService';

describe('validateMenuInput (Invariant 1)', () => {
  it('rejects negative price or portion', () => {
    expect(() => validateMenuInput({ nama: 'Ayam', harga: -1000, sisa_porsi: 10, tersedia: true })).toThrow(/negatif/i);
    expect(() => validateMenuInput({ nama: 'Ayam', harga: 20000, sisa_porsi: -1, tersedia: true })).toThrow(/negatif/i);
  });

  it('accepts 0 portion and marks as valid', () => {
    expect(validateMenuInput({ nama: 'Ayam Habis', harga: 20000, sisa_porsi: 0, tersedia: true })).toBe(true);
  });
});
```
- [ ] **Step 2: Run test to verify it fails**
Run: `npm test src/features/menu/services/menuService.test.ts`
Expected: FAIL.
- [ ] **Step 3: Implement menuService, useMenu, and Menu UI components**
Tegakkan Invariant 1, implementasikan listener real-time `onSnapshot` pada koleksi `menu`, buat `MenuCard` dengan badge "Habis" jika `sisa_porsi === 0`, dan form Sheet dengan validasi nama 1–60 karakter.
- [ ] **Step 4: Run test to verify it passes**
Run: `npm test src/features/menu/services/menuService.test.ts`
Expected: PASS.
- [ ] **Step 5: Commit**
```bash
git add src/features/menu/
git commit -m "feat: implement menu module with real-time sync and invariant 1 check"
```

---

### Task 4: Modul Pelanggan (Service, Hook, Komponen CRUD, & Validasi WhatsApp Unik)

**Files:**
- Create: `src/features/pelanggan/services/pelangganService.ts`
- Create: `src/features/pelanggan/hooks/usePelanggan.ts`
- Create: `src/features/pelanggan/components/PelangganCard.tsx`
- Create: `src/features/pelanggan/components/PelangganList.tsx`
- Create: `src/features/pelanggan/components/PelangganFormSheet.tsx`
- Create: `src/features/pelanggan/index.tsx`
- Test: `src/features/pelanggan/services/pelangganService.test.ts`

**Interfaces:**
- Consumes: `db` from `src/lib/firebase.ts`, `Pelanggan` from `src/types/index.ts`
- Produces:
  - `pelangganService.addPelanggan(pelanggan: Pelanggan): Promise<void>` (ID = `no_whatsapp`)
  - `pelangganService.checkWhatsAppExists(no_whatsapp: string): Promise<boolean>`
  - `usePelanggan(): { pelangganList: Pelanggan[], loading: boolean, error: string | null }`
  - `<PelangganFeature />` component for `/pelanggan`

- [ ] **Step 1: Write test for WhatsApp validation and uniqueness checks**
```typescript
import { describe, it, expect } from 'vitest';
import { validatePelangganInput } from './pelangganService';

describe('validatePelangganInput', () => {
  it('rejects invalid names and invalid WhatsApp format', () => {
    expect(() => validatePelangganInput({ nama: '', no_whatsapp: '081234567890', alamat: 'Jl Melati' })).toThrow(/nama/i);
    expect(() => validatePelangganInput({ nama: 'Budi', no_whatsapp: '12345', alamat: 'Jl Melati' })).toThrow(/whatsapp/i);
  });
});
```
- [ ] **Step 2: Run test to verify it fails**
Run: `npm test src/features/pelanggan/services/pelangganService.test.ts`
Expected: FAIL.
- [ ] **Step 3: Implement pelangganService, usePelanggan, and Pelanggan UI components**
Gunakan `no_whatsapp` sebagai ID dokumen Firestore, cegah duplikasi dengan mengecek eksistensi ID, dan buat kartu pelanggan dengan tautan langsung `wa.me/62...`.
- [ ] **Step 4: Run test to verify it passes**
Run: `npm test src/features/pelanggan/services/pelangganService.test.ts`
Expected: PASS.
- [ ] **Step 5: Commit**
```bash
git add src/features/pelanggan/
git commit -m "feat: implement pelanggan module with whatsapp uniqueness validation"
```

---

### Task 5: Modul Pesanan (Service, Hook, Komponen Pesanan, Invariant 2 & 3, & State Machine)

**Files:**
- Create: `src/features/pesanan/services/pesananService.ts`
- Create: `src/features/pesanan/hooks/usePesanan.ts`
- Create: `src/features/pesanan/components/PesananCard.tsx`
- Create: `src/features/pesanan/components/PesananList.tsx`
- Create: `src/features/pesanan/components/PesananFormSheet.tsx`
- Create: `src/features/pesanan/components/PesananDetailSheet.tsx`
- Create: `src/features/pesanan/index.tsx`
- Test: `src/features/pesanan/services/pesananService.test.ts`

**Interfaces:**
- Consumes: `db` from `src/lib/firebase.ts`, `Menu`, `Pelanggan`, `Pesanan`, `PesananStatus`
- Produces:
  - `pesananService.createPesanan(data: CreatePesananDTO): Promise<string>`
  - `pesananService.updateStatus(id: string, currentStatus: PesananStatus, nextStatus: PesananStatus, menuId: string, jumlahPorsi: number): Promise<void>`
  - `usePesanan(): { pesananList: Pesanan[], loading: boolean, error: string | null }`
  - `<PesananFeature />` component for `/pesanan`

- [ ] **Step 1: Write unit tests for Invariant 2, Invariant 3, and Status Transitions**
```typescript
import { describe, it, expect } from 'vitest';
import { calculateTotal, isValidStatusTransition, validatePesananPortion } from './pesananService';

describe('Pesanan Invariants & State Machine', () => {
  it('calculates total accurately (Invariant 3)', () => {
    expect(calculateTotal(25000, 2, 5000)).toBe(55000);
  });

  it('validates portion bounds against remaining stock (Invariant 2)', () => {
    expect(() => validatePesananPortion(0, 10)).toThrow(/minimal 1/i);
    expect(() => validatePesananPortion(11, 10)).toThrow(/melebihi/i);
    expect(validatePesananPortion(5, 10)).toBe(true);
  });

  it('strictly validates state machine transitions', () => {
    expect(isValidStatusTransition('menunggu_bayar', 'dibayar')).toBe(true);
    expect(isValidStatusTransition('menunggu_bayar', 'dibatalkan')).toBe(true);
    expect(isValidStatusTransition('menunggu_bayar', 'selesai')).toBe(false); // no skip
    expect(isValidStatusTransition('diproses', 'dibayar')).toBe(false); // no rollback
    expect(isValidStatusTransition('selesai', 'dibatalkan')).toBe(false); // terminal
  });
});
```
- [ ] **Step 2: Run test to verify it fails**
Run: `npm test src/features/pesanan/services/pesananService.test.ts`
Expected: FAIL.
- [ ] **Step 3: Implement pesananService, usePesanan, and UI components**
Implementasikan pembuatan pesanan dengan snapshot data, kurangi `sisa_porsi` menu saat pesanan dibuat, kembalikan porsi jika dibatalkan, dan tampilkan tombol transisi status dinamis hanya untuk langkah yang diizinkan.
- [ ] **Step 4: Run test to verify it passes**
Run: `npm test src/features/pesanan/services/pesananService.test.ts`
Expected: PASS.
- [ ] **Step 5: Commit**
```bash
git add src/features/pesanan/
git commit -m "feat: implement pesanan module with strict invariants and state machine"
```

---

### Task 6: Modul Laporan Harian (Agregasi Query, Filter Tanggal, & Empty State)

**Files:**
- Create: `src/features/laporan/services/laporanService.ts`
- Create: `src/features/laporan/hooks/useLaporan.ts`
- Create: `src/features/laporan/components/LaporanSummaryCards.tsx`
- Create: `src/features/laporan/components/PorsiTerjualTable.tsx`
- Create: `src/features/laporan/index.tsx`
- Test: `src/features/laporan/services/laporanService.test.ts`

**Interfaces:**
- Consumes: `Pesanan` from `src/types/index.ts`
- Produces:
  - `laporanService.getLaporanByDate(date: string): Promise<LaporanHarian>`
  - `useLaporan(selectedDate: string): { laporan: LaporanHarian | null, loading: boolean, error: string | null }`
  - `<LaporanFeature />` component for `/laporan`

- [ ] **Step 1: Write tests for aggregation logic excluding cancelled orders**
```typescript
import { describe, it, expect } from 'vitest';
import { aggregateLaporan } from './laporanService';
import { Pesanan } from '@/types';

describe('aggregateLaporan', () => {
  it('excludes dibatalkan orders and aggregates portions and revenue correctly', () => {
    const mockOrders: Partial<Pesanan>[] = [
      { nama_menu: 'Ayam Bakar', jumlah_porsi: 2, total: 55000, status: 'selesai', tanggal: '2026-10-02' },
      { nama_menu: 'Ayam Bakar', jumlah_porsi: 1, total: 30000, status: 'dibayar', tanggal: '2026-10-02' },
      { nama_menu: 'Ayam Bakar', jumlah_porsi: 3, total: 75000, status: 'dibatalkan', tanggal: '2026-10-02' }, // should ignore
    ];

    const result = aggregateLaporan(mockOrders as Pesanan[]);
    expect(result.totalPorsiTerjual).toBe(3);
    expect(result.totalUangMasuk).toBe(85000);
    expect(result.porsiPerMenu['Ayam Bakar']).toBe(3);
  });
});
```
- [ ] **Step 2: Run test to verify it fails**
Run: `npm test src/features/laporan/services/laporanService.test.ts`
Expected: FAIL.
- [ ] **Step 3: Implement laporanService, useLaporan, and Laporan UI components**
Buat filter tanggal harian (format `YYYY-MM-DD`), hitung agregasi porsi dan uang masuk, tampilkan tabel ringkasan, dan sajikan `EmptyState` jika tidak ada pesanan aktif pada tanggal tersebut.
- [ ] **Step 4: Run test to verify it passes**
Run: `npm test src/features/laporan/services/laporanService.test.ts`
Expected: PASS.
- [ ] **Step 5: Commit**
```bash
git add src/features/laporan/
git commit -m "feat: implement laporan module with date query and cancelled filter"
```

---

### Task 7: Layout Utama, Mobile Bottom Navigation Bar, & Routing Integration

**Files:**
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/BottomNav.tsx`
- Create: `src/components/layout/MainLayout.tsx`
- Modify: `src/App.tsx`
- Test: `src/components/layout/BottomNav.test.tsx`

**Interfaces:**
- Consumes: `<MenuFeature />`, `<PelangganFeature />`, `<PesananFeature />`, `<LaporanFeature />`
- Produces: Integrated SPA with 4 mobile tabs: `/menu`, `/pelanggan`, `/pesanan`, `/laporan`, with `/` redirecting to `/menu`.

- [ ] **Step 1: Write test for Bottom Navigation active tabs**
```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { BottomNav } from './BottomNav';

describe('BottomNav', () => {
  it('renders all 4 main module links', () => {
    render(
      <MemoryRouter initialEntries={['/menu']}>
        <BottomNav />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /menu/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /pelanggan/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /pesanan/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /laporan/i })).toBeInTheDocument();
  });
});
```
- [ ] **Step 2: Run test to verify it fails**
Run: `npm test src/components/layout/BottomNav.test.tsx`
Expected: FAIL.
- [ ] **Step 3: Implement Header, BottomNav, MainLayout, and App routes**
Rakit komponen `Header` (dengan tombol Seed Data cepat untuk testing), `BottomNav` dengan indikator aktif elegan, `MainLayout` mobile-centered (`max-w-md mx-auto`), dan `App.tsx` dengan konfigurasi router.
- [ ] **Step 4: Run test to verify it passes**
Run: `npm test src/components/layout/BottomNav.test.tsx`
Expected: PASS.
- [ ] **Step 5: Commit**
```bash
git add src/components/layout/ src/App.tsx
git commit -m "feat: implement main mobile layout and bottom navigation routing"
```

---

### Task 8: Pengujian Uji Tembus 6 Masukan Tidak Sah & Kesiapan Netlify

**Files:**
- Create: `src/features/verification/invalidInputs.test.ts`
- Create: `public/_redirects`
- Modify: `README.md`
- Test: Full test suite (`npm test`) and build test (`npm run build`)

**Interfaces:**
- Produces: Verification report for the 6 invalid inputs test suite and ready-to-deploy build artifact in `dist/`.

- [ ] **Step 1: Write integration tests covering the 6 invalid inputs (PRD Poin 8)**
```typescript
import { describe, it, expect } from 'vitest';
import { validateMenuInput } from '@/features/menu/services/menuService';
import { validatePelangganInput } from '@/features/pelanggan/services/pelangganService';
import { validatePesananPortion, isValidStatusTransition } from '@/features/pesanan/services/pesananService';

describe('Uji Tembus 6 Masukan Tidak Sah (PRD Poin 8)', () => {
  it('1. Field kosong: ditolak', () => {
    expect(() => validateMenuInput({ nama: '', harga: 20000, sisa_porsi: 5, tersedia: true })).toThrow();
  });

  it('2. Tipe salah: ditolak oleh validator', () => {
    expect(() => validateMenuInput({ nama: 'Ayam', harga: NaN, sisa_porsi: 5, tersedia: true })).toThrow();
  });

  it('3. Teks terlalu panjang: ditolak jika melebihi batas', () => {
    const longName = 'A'.repeat(61);
    expect(() => validateMenuInput({ nama: longName, harga: 20000, sisa_porsi: 5, tersedia: true })).toThrow();
  });

  it('4. Nilai negatif: melanggar Invariant 1, ditolak', () => {
    expect(() => validateMenuInput({ nama: 'Ayam', harga: -5000, sisa_porsi: 5, tersedia: true })).toThrow();
  });

  it('5. Nilai di luar batas: porsi = 0 atau porsi > stok (Invariant 2), ditolak', () => {
    expect(() => validatePesananPortion(0, 10)).toThrow();
    expect(() => validatePesananPortion(15, 10)).toThrow();
  });

  it('6. Perubahan status tidak sah: lompat status atau rollback, ditolak', () => {
    expect(isValidStatusTransition('menunggu_bayar', 'selesai')).toBe(false);
    expect(isValidStatusTransition('diproses', 'menunggu_bayar')).toBe(false);
  });
});
```
- [ ] **Step 2: Run verification test to verify it passes**
Run: `npm test src/features/verification/invalidInputs.test.ts`
Expected: PASS.
- [ ] **Step 3: Add `public/_redirects` and run production build**
Tambahkan `public/_redirects` dengan konten `/* /index.html 200` dan jalankan `npm run build` untuk memvalidasi bundle produksi Netlify tanpa error TypeScript atau CSS.
- [ ] **Step 4: Verify build output**
Run: `npm run build`
Expected: `dist/` directory generated cleanly with exit code 0.
- [ ] **Step 5: Commit**
```bash
git add public/_redirects src/features/verification/
git commit -m "test: add 6 invalid inputs test suite and configure netlify redirects"
```
