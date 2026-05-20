import { FileText, ArrowDownLeft, ArrowUpRight, FileCheck, Clock, Building, Calendar } from 'lucide-react';

const categories = [
  'Surat Masuk', 'Surat Keluar', 'Penawaran', 'Purchase Order',
  'Invoice', 'Kontrak', 'Nota Dinas', 'MoU', 'Lainnya'
];

const companies = [
  'PT. Almex Bintang Timur', 'PT. Mitra Solusi Teknologi', 'PT. Global Indo Perkasa',
  'CV. Sentosa Abadi', 'PT. Delta Energi Nusantara'
];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function generateDocuments(count = 45) {
  return Array.from({ length: count }, (_, i) => {
    const date = randomDate(new Date(2025, 0, 1), new Date(2025, 4, 20));
    const direction = Math.random() > 0.5 ? 'Masuk' : 'Keluar';
    const jenis = categories[Math.floor(Math.random() * categories.length)];
    const confidence = Math.floor(65 + Math.random() * 35);
    const company = companies[Math.floor(Math.random() * companies.length)];
    const prefixes = ['SM', 'SK', 'PO', 'INV', 'KTR', 'ND', 'MOU', 'PNW'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = String(i + 1).padStart(4, '0');

    return {
      id: i + 1,
      nama: `${prefix}_${company.replace(/[.\s]/g, '_')}_${num}.pdf`,
      namaPt: company,
      tanggalSurat: formatDate(date),
      tanggalUnggah: formatDate(new Date(date.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)),
      arah: direction,
      jenis,
      klasifikasi: `${direction} · ${jenis}`,
      confidence,
      status: confidence >= 90 ? 'verified' : confidence >= 75 ? 'review' : 'pending',
      ukuran: `${(Math.random() * 5 + 0.2).toFixed(1)} MB`,
    };
  }).sort((a, b) => new Date(b.tanggalUnggah) - new Date(a.tanggalUnggah));
}

export { categories, companies };
