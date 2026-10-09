import { Timestamp } from 'firebase/firestore';

export interface Menu {
  id?: string;
  nama: string;         // 1 sampai 60 karakter
  harga: number;        // number bulat >= 0
  sisa_porsi: number;   // number bulat >= 0
  tersedia: boolean;    // true tampil, false sembunyi
  dibuat_pada?: Timestamp | any;
}

export interface Pelanggan {
  id?: string;          // sama persis dengan no_whatsapp
  nama: string;         // 1 sampai 60 karakter
  no_whatsapp: string;  // diawali 08, 10-13 digit
  alamat: string;       // 1 sampai 200 karakter
  dibuat_pada?: Timestamp | any;
}

export type PesananStatus = 
  | 'menunggu_bayar'
  | 'dibayar'
  | 'diproses'
  | 'selesai'
  | 'dibatalkan';

export interface Pesanan {
  id?: string;
  pelanggan_id: string;   // ID dokumen pelanggan (nomor WhatsApp)
  nama_pelanggan: string; // Salinan nama saat memesan
  alamat_kirim: string;   // Salinan alamat saat memesan
  menu_id: string;        // ID dokumen menu yang dipesan
  nama_menu: string;      // Salinan nama menu saat memesan
  harga_satuan: number;   // Harga menu saat memesan
  jumlah_porsi: number;   // Bulat, min 1 dan <= sisa_porsi menu
  ongkir: number;         // Minimal 0
  total: number;          // harga_satuan * jumlah_porsi + ongkir
  status: PesananStatus;  // Status alur pesanan
  bukti_bayar?: string;   // Tautan bukti bayar / catatan
  tanggal: string;        // Format "YYYY-MM-DD"
  email_pelanggan?: string;
  user_id?: string;
  dibuat_pada?: Timestamp | any;
}

export interface LaporanHarian {
  tanggal: string;
  totalPorsiTerjual: number;
  totalUangMasuk: number;
  porsiPerMenu: Record<string, number>;
  pesananList: Pesanan[];
}
