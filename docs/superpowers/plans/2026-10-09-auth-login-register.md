# Auth (Login & Daftar Akun) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan sistem autentikasi (Login dan Registrasi akun) menggunakan Firebase Authentication dengan pemisahan peran antara Admin/Pengelola dan Pelanggan, proteksi rute, serta integrasi profil pelanggan ke koleksi Firestore `pelanggan`.

**Architecture:** Menggunakan modular feature-based architecture (`src/features/auth/`) dengan Firebase Auth SDK modular, service layer untuk operasi autentikasi dan terjemahan kode galat, React Context (`AuthContext`) untuk manajemen state sesi pengguna dan peran (*role*), serta `ProtectedRoute` dan navigasi adaptif (*role-based*) di `App.tsx`, `Header.tsx`, dan `BottomNav.tsx`.

**Tech Stack:** React 19, TypeScript, Firebase v12 (Auth & Firestore), Vite, React Router v7, Vitest, Testing Library, Tailwind CSS v4, Lucide React.

**Spec:** [docs/superpowers/specs/2026-10-09-auth-login-register-design.md](../specs/2026-10-09-auth-login-register-design.md)

## Global Constraints

- Tetap mematuhi skema resmi Firestore: hanya 3 koleksi (`menu`, `pelanggan`, `pesanan`).
- ID dokumen koleksi `pelanggan` tetap nomor WhatsApp (`no_whatsapp`), wajib diawali `08` dan memiliki panjang 10–13 angka.
- Password akun minimal 6 karakter sesuai standar Firebase Auth.
- Pesan galat teknis Firebase Auth harus diterjemahkan ke pesan bahasa Indonesia yang mudah dipahami pengguna.
- Kredensial tidak di-commit ke Git; konfigurasi menggunakan variabel environment Vite.

## Review Focus

- Nomor WhatsApp tidak valid (bukan awalan 08 atau bukan 10-13 digit): form registrasi menolak sebelum submit ke Firebase.
- Konfirmasi kata sandi tidak cocok: pesan galat inline muncul sebelum pemanggilan auth service.
- Pengguna belum login mengakses URL internal: otomatis dialihkan (*redirect*) ke `/login`.
- Pelanggan mencoba mengakses rute pengelola (`/pelanggan` atau `/laporan`): dialihkan kembali ke `/menu` dengan notifikasi hak akses.
- Akun keluar (logout): sesi dan context dibersihkan seketika dan dialihkan ke `/login`.

---

### Task 1: Setup Firebase Auth & Tipe Data Autentikasi

**Files:**
- Modify: `src/lib/firebase.ts`
- Create: `src/features/auth/types.ts`
- Test: `src/features/auth/types.test.ts`

**Interfaces:**
- Produces: `auth` export from `src/lib/firebase.ts`, types `UserRole`, `AuthUser`, `RegisterPelangganDTO`, `LoginDTO` in `src/features/auth/types.ts`.

- [ ] **Step 1: Write the failing test**

```ts
// src/features/auth/types.test.ts
import { describe, it, expect } from 'vitest';
import { auth } from '@/lib/firebase';
import { UserRole } from './types';

describe('Auth Setup & Types', () => {
  it('should export initialized auth instance', () => {
    expect(auth).toBeDefined();
  });

  it('should define valid UserRoles', () => {
    const roles: UserRole[] = ['admin', 'pelanggan'];
    expect(roles).toContain('admin');
    expect(roles).toContain('pelanggan');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test src/features/auth/types.test.ts`
Expected: FAIL with missing exports.

- [ ] **Step 3: Implement Auth export & types**

- Update `src/lib/firebase.ts` to export `auth = getAuth(app)`.
- Create `src/features/auth/types.ts` defining `UserRole`, `AuthUser`, `RegisterPelangganDTO`, and `LoginDTO`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test src/features/auth/types.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/firebase.ts src/features/auth/types.ts src/features/auth/types.test.ts
git commit -m "feat(auth): initialize firebase auth and define auth types"
```

---

### Task 2: Service Layer & Error Formatting

**Files:**
- Create: `src/features/auth/services/authService.ts`
- Test: `src/features/auth/services/authService.test.ts`

**Interfaces:**
- Consumes: `auth`, `db` from `src/lib/firebase.ts`, types from `src/features/auth/types.ts`.
- Produces: `formatAuthError(error: any): string`, `isEmailAdmin(email?: string | null): boolean`, `loginUser(dto: LoginDTO)`, `registerPelanggan(dto: RegisterPelangganDTO)`, `logoutUser()`.

- [ ] **Step 1: Write the failing test**

```ts
// src/features/auth/services/authService.test.ts
import { describe, it, expect } from 'vitest';
import { formatAuthError, isEmailAdmin } from './authService';

describe('authService helpers', () => {
  it('formats invalid-credential error message to friendly Indonesian', () => {
    const err = { code: 'auth/invalid-credential', message: 'invalid' };
    expect(formatAuthError(err)).toBe('Email atau kata sandi yang Anda masukkan salah.');
  });

  it('formats email-already-in-use error message to friendly Indonesian', () => {
    const err = { code: 'auth/email-already-in-use', message: 'in use' };
    expect(formatAuthError(err)).toContain('sudah terdaftar');
  });

  it('identifies admin email correctly', () => {
    expect(isEmailAdmin('admin@dapurnia.com')).toBe(true);
    expect(isEmailAdmin('budi@gmail.com')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test src/features/auth/services/authService.test.ts`
Expected: FAIL with missing module.

- [ ] **Step 3: Implement authService.ts**

Implement `formatAuthError`, `isEmailAdmin`, `loginUser`, `registerPelanggan` (which creates the Auth user and saves to Firestore `pelanggan/{no_whatsapp}`), and `logoutUser`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test src/features/auth/services/authService.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/services/authService.ts src/features/auth/services/authService.test.ts
git commit -m "feat(auth): implement authService and error formatting"
```

---

### Task 3: AuthContext & useAuth Hook

**Files:**
- Create: `src/features/auth/context/AuthContext.tsx`
- Create: `src/features/auth/hooks/useAuth.ts`
- Test: `src/features/auth/context/AuthContext.test.tsx`

**Interfaces:**
- Consumes: `authService`, `auth` from `src/lib/firebase.ts`.
- Produces: `AuthProvider`, `useAuth()` exposing `{ user, role, profile, loading, error, login, register, logout }`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/auth/context/AuthContext.test.tsx
import React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AuthProvider } from './AuthContext';
import { useAuth } from '../hooks/useAuth';

describe('AuthContext', () => {
  it('throws error when useAuth is called outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test src/features/auth/context/AuthContext.test.tsx`
Expected: FAIL with missing files.

- [ ] **Step 3: Implement AuthContext and useAuth**

- Implement `AuthContext` with Firebase `onAuthStateChanged` listener to populate user and determine role via `isEmailAdmin(user.email)` or fetching `pelanggan` document.
- Export `AuthProvider` and `useAuth` hook.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test src/features/auth/context/AuthContext.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/context/AuthContext.tsx src/features/auth/hooks/useAuth.ts src/features/auth/context/AuthContext.test.tsx
git commit -m "feat(auth): implement AuthContext and useAuth hook"
```

---

### Task 4: Halaman Pendaftaran Pelanggan (`RegisterPage`)

**Files:**
- Create: `src/features/auth/components/RegisterPage.tsx`
- Test: `src/features/auth/components/RegisterPage.test.tsx`

**Interfaces:**
- Consumes: `useAuth` from `src/features/auth/hooks/useAuth`.
- Produces: `RegisterPage` component mounted at route `/register`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/auth/components/RegisterPage.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { RegisterPage } from './RegisterPage';

describe('RegisterPage validation', () => {
  it('shows error if no_whatsapp does not start with 08', async () => {
    // Test validation message for WhatsApp number not starting with 08
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test src/features/auth/components/RegisterPage.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement RegisterPage.tsx**

- Fields: Nama (1-60 karakter), Nomor WhatsApp (08, 10-13 digit), Alamat (1-200 karakter), Email, Password (min 6 karakter), Konfirmasi Password.
- Client validation per PRD rules, loading indicator during submission, friendly error alert on failure, link to `/login`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test src/features/auth/components/RegisterPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/components/RegisterPage.tsx src/features/auth/components/RegisterPage.test.tsx
git commit -m "feat(auth): implement RegisterPage with inline validations"
```

---

### Task 5: Halaman Masuk (`LoginPage`)

**Files:**
- Create: `src/features/auth/components/LoginPage.tsx`
- Test: `src/features/auth/components/LoginPage.test.tsx`

**Interfaces:**
- Consumes: `useAuth` from `src/features/auth/hooks/useAuth`.
- Produces: `LoginPage` component mounted at route `/login`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/features/auth/components/LoginPage.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  it('renders email and password inputs', () => {
    // renders inputs and login button
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test src/features/auth/components/LoginPage.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement LoginPage.tsx**

- Input email & password, toggle lihat kata sandi, tombol demo kredensial (Admin: `admin@dapurnia.com` / Pelanggan demo), link ke `/register`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test src/features/auth/components/LoginPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/components/LoginPage.tsx src/features/auth/components/LoginPage.test.tsx
git commit -m "feat(auth): implement LoginPage with demo account credentials"
```

---

### Task 6: ProtectedRoute, Role-Based Navigation & Integrasi Routing

**Files:**
- Create: `src/features/auth/components/ProtectedRoute.tsx`
- Create: `src/features/pesanan/components/PesananSaya.tsx`
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/BottomNav.tsx`
- Modify: `src/App.tsx`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes: `useAuth`, `ProtectedRoute`, `LoginPage`, `RegisterPage`.
- Produces: Complete authenticated application routing with role guard.

- [ ] **Step 1: Write the failing test**

```tsx
// src/App.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Routing with Auth', () => {
  it('renders login page when unauthenticated', async () => {
    render(<App />);
    expect(await screen.findByText(/Masuk ke Dapur Nia/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test src/App.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement ProtectedRoute, Role Navigation & App Routes**

- Implement `ProtectedRoute`: redirects unauthenticated to `/login`, redirects unauthorized roles to `/menu`.
- Update `Header.tsx`: display user badge (`👑 Pengelola` / `👤 Pelanggan`), user email/name, and Logout button.
- Update `BottomNav.tsx`: show 4 tabs for Admin (`/menu`, `/pelanggan`, `/pesanan`, `/laporan`) and 2 tabs for Pelanggan (`/menu`, `/pesanan-saya`).
- Implement `PesananSaya.tsx`: filter pesanan by `pelanggan_id === profile.no_whatsapp`.
- Update `App.tsx`: wrap with `AuthProvider`, configure `/login`, `/register`, and protected routes.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS (all tests pass)

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/components/ProtectedRoute.tsx src/features/pesanan/components/PesananSaya.tsx src/components/layout/Header.tsx src/components/layout/BottomNav.tsx src/App.tsx src/App.test.tsx
git commit -m "feat(auth): integrate protected routes, role-based navigation, and order history"
```
