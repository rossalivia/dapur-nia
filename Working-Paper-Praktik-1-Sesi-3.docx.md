**Working Paper: Praktik 1 Sesi 3**

Kasus Aplikasi Pemesanan Katering Dapur Nia

**Identitas**

| Keterangan | Isian |
| :---- | :---- |
| Nama peserta | Rossa Livia |
| Tanggal | 8 Oktober 2026 |
| Sesi | Sesi 3 - Antarmuka CRUD & Cloud Firestore |
| Nama proyek Antigravity | Dapur Nia (dapur-nia) |

**A. Pemeriksaan UI CRUD**

| Pemeriksaan | Hasil | Catatan perbaikan |
| :---- | :---- | :---- |
| Daftar data | Sesuai | Menampilkan daftar menu, pelanggan, pesanan, dan laporan dalam kartu (Card) mobile-first yang responsif, dilengkapi search bar dan filter status. |
| Formulir | Sesuai | Formulir berbasis modal Dialog/Sheet shadcn/ui dengan label di atas input, pesan error inline, stepper porsi, dan tombol aksi deskriptif. |
| Create | Sesuai | Berhasil menambahkan menu baru, mendaftarkan pelanggan, serta membuat pesanan katering baru dengan auto-fill profil pelanggan. |
| Read | Sesuai | Berhasil membaca data Firestore secara real-time via listener onSnapshot dengan sorting in-memory yang stabil. |
| Update | Sesuai | Berhasil mengubah menu/harga/stok porsi, mengubah profil pelanggan, dan memperbarui alur status pesanan (menunggu -> dibayar -> dimasak -> selesai). |
| Delete | Sesuai | Berhasil menghapus menu atau pelanggan dengan konfirmasi pop-up, serta membatalkan pesanan dengan otomatis mengembalikan stok sisa porsi. |
| Loading state | Sesuai | Menampilkan komponen LoadingState dengan animasi spinner dan pesan informatif spesifik per modul. |
| Empty state | Sesuai | Menampilkan komponen EmptyState saat koleksi kosong atau hasil filter nihil, lengkap dengan tombol CTA aksi relevan. |
| Error state | Sesuai | Menampilkan pesan error ramah pengguna saat koneksi gagal serta pesan validasi inline merah di bawah input yang tidak sah. |

**B. Tiga State Tampilan**

| State | Kondisi pemicu | Pesan | Tindakan pengguna | Sudah |
| :---- | :---- | :---- | :---- | :---- |
| Loading | Saat aplikasi pertama kali dibuka atau sedang mengambil/menyinkronkan data koleksi dari Cloud Firestore. | "Memuat daftar menu katering..." / "Memuat data pelanggan..." / "Memuat riwayat pesanan Anda..." | Menunggu hingga proses sinkronisasi data selesai; tombol aksi dinonaktifkan sementara untuk mencegah submit ganda. | ✓ (Sudah) |
| Empty | Saat koleksi belum memiliki dokumen atau kata kunci pencarian/filter status tidak menemukan data yang cocok. | "Belum Ada Menu" ("Daftar menu harian masih kosong. Tambahkan menu baru untuk mulai mengelola katering.") / "Belum Ada Pesanan" | Mengklik tombol CTA seperti "+ Tambah Menu", "+ Tambah Pelanggan", atau mereset filter/kata kunci pencarian. | ✓ (Sudah) |
| Error | Saat jaringan internet terputus, aturan Firestore menolak akses, atau pengguna memasukkan data form yang melanggar validasi. | "Gagal memuat data menu dari server." / Pesan validasi inline: "Nama menu maksimal 60 karakter", "Jumlah porsi minimal 1", dll. | Memperbaiki isian data sesuai petunjuk error inline, memeriksa koneksi internet, lalu menekan kembali tombol simpan. | ✓ (Sudah) |
