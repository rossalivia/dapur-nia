**Working Paper: Praktik 2 Sesi 3**

Kasus Aplikasi Pemesanan Katering Dapur Nia

**Identitas**

| Keterangan | Isian |
| :---- | :---- |
| Nama peserta | Rossa Livia |
| Tanggal | 8 Oktober 2026 |
| Sesi | Sesi 3 - Antarmuka CRUD & Cloud Firestore |
| Nama proyek Antigravity | Dapur Nia (dapur-nia) |
| Nama proyek Firebase | boothcampplan |
| Nama pasangan | Mandiri |
| URL pasangan | https://dapur-nia-app.netlify.app |

**A. Koneksi dan Koleksi Firestore**

| No | Koleksi | Dokumen awal | Read | Create | Catatan |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | menu | Menu harian katering (nama_menu: "Paket Nasi Ayam Bakar Madu", harga: 28000, sisa_porsi: 25, kategori: "makanan_utama") | [✓] | [✓] | Berhasil tersambung real-time via onSnapshot dan penambahan menu baru via addDoc. |
| 2 | pelanggan | Data pelanggan katering (ID dokumen = no_whatsapp: "081234567890", nama: "Ibu Siti Rahma", alamat: "Jl. Melati No. 12") | [✓] | [✓] | Berhasil query profil pelanggan dan registrasi pelanggan baru. |
| 3 | pesanan | Transaksi pesanan katering (menu_id, pelanggan_id, jumlah_porsi: 5, total_harga: 140000, status: "menunggu_bayar") | [✓] | [✓] | Berhasil membuat pesanan dengan pemotongan stok otomatis via Firestore runTransaction. |

**B. Pemeriksaan CRUD**

| Operasi | Data atau dokumen | Hasil UI | Sudah |
| :---- | :---- | :---- | :---- |
| Create | Menambahkan menu baru atau membuat transaksi pesanan baru | Form modal tertutup, toast notifikasi sukses muncul, dan data baru langsung tampil di daftar tanpa reload | [✓] |
| Read | Membaca koleksi menu, pelanggan, dan riwayat pesanan dari Firestore | Data ditampilkan dalam bentuk kartu responsif lengkap dengan pencarian dan filter status real-time | [✓] |
| Update | Mengubah harga menu, stok porsi, atau memperbarui status pesanan (menunggu -> dibayar -> diproses -> selesai) | Kartu dan badge status berubah secara real-time seketika data di Firestore diperbarui | [✓] |
| Delete | Menghapus menu katering atau membatalkan transaksi pesanan | Muncul konfirmasi pop-up, dokumen terhapus dari daftar UI, dan stok porsi otomatis dikembalikan | [✓] |

**C. Tiga Invariant**

| No | Invariant | Akibat bila dilanggar | Ditegakkan pada | Hasil uji |
| :---- | :---- | :---- | :---- | :---- |
| 1 | Validasi porsi pesanan terhadap stok menu (jumlah_porsi minimal 1 dan tidak boleh melebihi sisa_porsi yang tersedia) | Terjadi *overselling* (pesanan diterima melebihi kapasitas dapur, pembeli memesan menu yang stoknya sudah habis/minus) | Validasi form pesanan & transaksi atomik Firestore (`runTransaction`) saat submit pesanan | Berhasil (form menolak input > stok dan memunculkan peringatan error batas stok) |
| 2 | Perhitungan total harga pesanan (`total_harga = (harga_satuan * jumlah_porsi) + ongkir`, dengan ongkir >= 0) | Ketidaksesuaian rekonsiliasi kas/pembayaran, katering mengalami kerugian finansial akibat salah hitung | Fungsi `calculateTotal`, reactive stepper porsi di UI, dan logic verifikasi transaksi | Berhasil (kalkulasi total otomatis dan akurat secara real-time, lolos unit test 100%) |
| 3 | Alur transisi status pesanan satu arah yang valid (`menunggu_bayar` -> `dibayar` -> `diproses` -> `selesai` / `dibatalkan`) | Dapur memproses pesanan yang belum dibayar, atau pesanan yang sudah selesai/batal diubah sembarangan | Fungsi `isValidStatusTransition` dan logika tombol aksi pembaruan status di antarmuka pesanan | Berhasil (hanya tombol transisi yang sah yang dapat ditekan, status final terkunci) |
