export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  const rounded = Math.round(amount);
  return `Rp ${rounded.toLocaleString('id-ID')}`;
}

export function validateWhatsApp(no_whatsapp: string): boolean {
  if (!no_whatsapp) return false;
  // Wajib diawali 08, panjang 10 sampai 13 angka
  const regex = /^08\d{8,11}$/;
  return regex.test(no_whatsapp.trim());
}

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
