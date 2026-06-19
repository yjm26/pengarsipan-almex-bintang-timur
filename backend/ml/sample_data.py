"""Sample training data for Naive Bayes document classifier."""

def get_training_data() -> tuple[list[str], list[str], list[str]]:
    """Returns (texts, arah_labels, jenis_labels) with realistic Indonesian company letters."""
    
    data = []
    
    # ============ SURAT MASUK ============
    
    # Purchase Order - Masuk
    po_masuk = [
        "Dengan hormat, kami dari PT Sinar Jaya ingin mengajukan purchase order untuk pengadaan spare part mesin produksi sebanyak 500 unit dengan nilai kontrak Rp 150.000.000. Mohon dapat diproses secepatnya.",
        "Purchase Order No. PO-2024-001 untuk pengadaan bahan baku plastik sebanyak 2 ton dari supplier PT Kimia Farma. Total nilai pembelian Rp 85.000.000.",
        "Bersama ini kami sampaikan purchase order pengadaan peralatan kantor meliputi meja kerja 20 unit, kursi kantor 20 unit, dan komputer desktop 15 unit.",
        "PO Nomor 2024/045 tertanggal 15 Maret 2024 untuk pemesanan bahan baku kertas HVS A4 sebanyak 500 rim dari PT Kertas Nusantara.",
        "Dengan ini kami melakukan pemesanan purchase order atas pengadaan alat keselamatan kerja (APD) untuk kebutuhan proyek pembangunan gedung baru.",
        "Purchase order pengadaan material konstruksi berupa semen Portland 1000 sak, besi beton 500 batang, dan pasir 200 kubik dari supplier lokal.",
        "Kami mengajukan PO untuk pembelian mesin CNC baru sebanyak 3 unit dengan spesifikasi sesuai lampiran teknis. Nilai total Rp 2.500.000.000.",
        "PO pengadaan spare part kendaraan operasional meliputi oli mesin, filter udara, dan kampas rem untuk 50 unit kendaraan perusahaan.",
    ]
    data.extend([(t, "Masuk", "Purchase Order") for t in po_masuk])
    
    # Invoice - Masuk
    inv_masuk = [
        "Invoice No. INV-2024-089 untuk pembayaran jasa konsultasi manajemen periode Januari-Maret 2024 sebesar Rp 75.000.000. Pembayaran jatuh tempo 30 hari.",
        "Tagihan atas pengiriman barang nomor faktur 001/INV/IV/2024 dengan total pembayaran Rp 45.500.000 termasuk PPN 11%.",
        "Invoice untuk layanan maintenance server dan jaringan selama 6 bulan sebesar Rp 120.000.000. Mohon ditransfer ke rekening perusahaan kami.",
        "Faktur penjualan atas pengadaan bahan kimia industri sebanyak 500 liter dengan harga Rp 150.000 per liter, total Rp 75.000.000.",
        "Tagihan jasa pengiriman logistik dari Jakarta ke Surabaya untuk 5 kontainer ukuran 40 feet dengan biaya Rp 250.000.000.",
        "Invoice billing untuk penggunaan cloud server dan layanan IT selama Q1 2024 sebesar Rp 35.000.000 per bulan.",
        "Nota tagihan atas pembelian kertas HVS dan alat tulis kantor sepanjang bulan Februari 2024 dengan total Rp 12.500.000.",
        "Faktur pembayaran jasa ekspedisi pengiriman dokumen dan paket sebanyak 200 pengiriman dengan total biaya Rp 8.000.000.",
    ]
    data.extend([(t, "Masuk", "Invoice") for t in inv_masuk])
    
    # Surat Penawaran - Masuk
    sp_masuk = [
        "Dengan hormat, PT Maju Bersama bermaksud mengajukan surat penawaran kerjasama pengadaan bahan baku industri makanan dengan harga bersaing dan kualitas terjamin.",
        "Penawaran harga untuk layanan cleaning service gedung perkantoran selama 1 tahun dengan biaya Rp 50.000.000 per bulan.",
        "Kami bermaksud mengajukan penawaran kerjasama penyediaan tenaga kerja outsourcing untuk divisi produksi dan warehouse.",
        "Surat penawaran harga jasa pengiriman logistik darat dan laut untuk rute Jawa-Sumatera-Kalimantan dengan tarif kompetitif.",
        "PT Teknologi Solusi mengajukan penawaran pengadaan sistem ERP terintegrasi untuk manajemen perusahaan dengan implementasi 6 bulan.",
        "Penawaran kerjasama penyediaan catering karyawan sebanyak 500 porsi per hari dengan menu bervariasi dan harga Rp 25.000 per porsi.",
        "Surat penawaran resmi dari distributor alat laboratorium untuk pengadaan mikroskop digital dan spektrofotometer.",
        "Penawaran jasa keamanan gedung dengan 20 personel security 24 jam selama 1 tahun kontrak.",
    ]
    data.extend([(t, "Masuk", "Surat Penawaran") for t in sp_masuk])
    
    # Kontrak - Masuk
    kontrak_masuk = [
        "Kontrak kerjasama No. KTR/2024/001 antara PT Almex Bintang Timur dan PT Supplier Utama untuk pengadaan bahan baku selama 12 bulan.",
        "Perjanjian kontrak jasa keamanan gedung dengan PT Security Jaya untuk periode 1 Januari 2024 sampai 31 Desember 2024.",
        "Draft kontrak kerjasama kemitraan bisnis dengan PT Mitra Sejati untuk distribusi produk ke wilayah Indonesia Timur.",
        "Kontrak pengadaan jasa maintenance AC sentral gedung kantor pusat dengan nilai kontrak Rp 180.000.000 per tahun.",
        "Perjanjian sewa menyewa ruang kantor di gedung Graha Pena lantai 12 selama 3 tahun dengan biaya Rp 150.000.000 per tahun.",
        "Kontrak kerjasama outsourcing tenaga kerja cleaning service dengan PT Bersih Sejahtera untuk 30 orang petugas.",
        "Perjanjian kerjasama pengembangan aplikasi mobile perusahaan dengan vendor IT selama 8 bulan implementasi.",
        "Kontrak supply bahan bakar minyak untuk armada kendaraan operasional perusahaan selama 1 tahun.",
    ]
    data.extend([(t, "Masuk", "Kontrak") for t in kontrak_masuk])
    
    # Nota Dinas - Masuk
    nd_masuk = [
        "Nota Dinas dari Kepala Divisi HRD kepada Direktur Utama perihal rencana pelaksanaan pelatihan karyawan angkatan ke-5 tahun 2024.",
        "Nota Dinas No. ND/003/IV/2024 dari Manajer Operasional tentang evaluasi kinerja mesin produksi line A dan rencana penggantian.",
        "Nota Dinas internal perihal permintaan penambahan anggaran divisi IT untuk pengadaan server baru dan lisensi software.",
        "Nota Dinas dari Bagian Umum tentang rencana renovasi toilet dan mushola gedung kantor lantai 1 dan 2.",
        "Nota Dinas perihal rencana penerapan sistem absensi digital berbasis fingerprint untuk seluruh karyawan kantor pusat.",
        "Nota Dinas dari Manajer Keuangan tentang penyesuaian anggaran operasional Q2 2024 karena kenaikan harga bahan baku.",
        "Nota Dinas internal perihal rencana mutasi dan rotasi karyawan divisi produksi untuk efisiensi kerja.",
        "Nota Dinas dari Kepala Gudang tentang kebutuhan penambahan rak penyimpanan untuk produk jadi dan bahan baku.",
    ]
    data.extend([(t, "Masuk", "Nota Dinas") for t in nd_masuk])
    
    # MoU - Masuk
    mou_masuk = [
        "Nota Kesepahaman (MoU) antara PT Almex Bintang Timur dengan Universitas Indonesia tentang program magang mahasiswa dan penelitian bersama.",
        "MoU kerjasama strategis dengan PT Bank Nasional untuk layanan payroll dan pembiayaan karyawan.",
        "Memorandum of Understanding antara perusahaan dengan Dinas Perindustrian tentang program sertifikasi produk industri.",
        "MoU kerjasama dengan asosiasi pengusaha tentang pengembangan standar mutu produk nasional.",
        "Nota Kesepahaman dengan PT Logistik Nusantara tentang kerjasama distribusi dan pergudangan produk perusahaan.",
        "MoU antara PT Almex dengan lembaga sertifikasi ISO tentang proses audit dan sertifikasi ISO 9001:2015.",
        "Memorandum of Understanding dengan perusahaan asing tentang transfer teknologi manufaktur.",
        "MoU kerjasama dengan pemerintah daerah tentang program CSR dan pengembangan masyarakat sekitar pabrik.",
    ]
    data.extend([(t, "Masuk", "MoU") for t in mou_masuk])
    
    # Lainnya - Masuk
    lainnya_masuk = [
        "Surat undangan rapat koordinasi bulanan dari Asosiasi Pengusaha Indonesia (APINDO) untuk membahas regulasi ketenagakerjaan terbaru.",
        "Surat pemberitahuan dari Dinas Tenaga Kerja tentang kewajiban pelaporan data ketenagakerjaan semester 1 tahun 2024.",
        "Undangan seminar nasional tentang teknologi industri 4.0 dan transformasi digital di sektor manufaktur.",
        "Surat edaran dari Kementerian Perindustrian tentang standar baru emisi gas buang untuk industri manufaktur.",
        "Surat pemberitahuan perubahan harga dari supplier utama bahan baku karena kenaikan harga komoditas global.",
        "Surat undangan dari Kamar Dagang dan Industri untuk menghadiri pameran dagang internasional.",
        "Surat peringatan dari dinas lingkungan hidup tentang pengelolaan limbah industri yang belum sesuai standar.",
        "Surat ucapan terima kasih dari pelanggan atas kerjasama pengiriman tepat waktu selama kuartal pertama.",
    ]
    data.extend([(t, "Masuk", "Lainnya") for t in lainnya_masuk])
    
    # ============ SURAT KELUAR ============
    
    # Purchase Order - Keluar
    po_keluar = [
        "Dengan ini kami dari PT Almex Bintang Timur mengirimkan purchase order untuk pengadaan bahan baku karet sebanyak 5 ton dari PT Karet Nusantara.",
        "Purchase Order No. PO/ABT/2024/050 untuk pemesanan kemasan karton dan plastik dari PT Packaging Indonesia.",
        "Kami mengajukan PO pengadaan alat uji laboratorium dari distributor resmi untuk keperluan quality control produksi.",
        "PO untuk pembelian chemical cleaning dan pelumas industri dari PT Chemical Jaya dengan nilai Rp 95.000.000.",
        "Purchase order pengadaan seragam kerja dan APD untuk 200 karyawan produksi dari vendor tekstil terpercaya.",
        "PO pengadaan material elektrikal untuk proyek instalasi panel listrik gedung baru sebesar Rp 350.000.000.",
        "Purchase order untuk pengadaan komputer dan printer kantor sebanyak 25 set dari PT Komputer Nusantara.",
        "PO pengadaan bahan bakar solar untuk generator cadangan pabrik selama 6 bulan ke depan.",
    ]
    data.extend([(t, "Keluar", "Purchase Order") for t in po_keluar])
    
    # Invoice - Keluar
    inv_keluar = [
        "Invoice No. INV/ABT/2024/075 untuk penjualan produk karet olahan sebanyak 10 ton kepada PT Ban Indonesia senilai Rp 500.000.000.",
        "Tagihan atas jasa custom manufacturing produk karet teknik untuk PT Otomotif Nasional sebesar Rp 275.000.000.",
        "Faktur penjualan ekspor produk karet alam ke PT Trading Internasional untuk pengiriman ke Jepang senilai USD 45.000.",
        "Invoice untuk layanan konsultasi teknik manufaktur yang diberikan kepada PT Mitra Industri selama 3 bulan.",
        "Tagihan penjualan produk jadi karet silikon medical grade sebanyak 500 kg kepada PT Farmasi Sehat senilai Rp 180.000.000.",
        "Faktur penjualan spare part mesin produksi bekas yang dijual lelang kepada PT Mesin Rekondisi.",
        "Invoice pengiriman produk ekspor ke Malaysia sebanyak 20 ton dengan nilai USD 120.000 FOB Jakarta.",
        "Tagihan jasa pergudangan dan distribusi produk ke 15 distributor regional selama bulan Maret 2024.",
    ]
    data.extend([(t, "Keluar", "Invoice") for t in inv_keluar])
    
    # Surat Penawaran - Keluar
    sp_keluar = [
        "Dengan hormat, kami dari PT Almex Bintang Timur bermaksud mengajukan surat penawaran produk karet teknik untuk kebutuhan industri otomotif nasional.",
        "Penawaran harga produk karet silikon untuk aplikasi medis dan farmasi dengan standar FDA dan ISO 10993.",
        "Surat penawaran kerjasama supply produk karet industri ke PT Manufaktur Jaya untuk periode 2024-2025.",
        "Penawaran harga jasa custom molding dan extrusion karet sesuai spesifikasi teknis pelanggan.",
        "Surat penawaran produk karet tahan panas dan tahan kimia untuk aplikasi industri pertambangan dan minyak gas.",
        "Penawaran ekspor produk karet alam olahan ke buyer di Eropa dengan harga kompetitif dan sertifikasi standar internasional.",
        "Surat penawaran pengadaan produk karet untuk kebutuhan proyek infrastruktur jalan tol nasional.",
        "Penawaran kerjasama supply produk karet untuk industri elektronik dan semikonduktor.",
    ]
    data.extend([(t, "Keluar", "Surat Penawaran") for t in sp_keluar])
    
    # Kontrak - Keluar
    kontrak_keluar = [
        "Kontrak penjualan produk karet teknik No. KTR/ABT/2024/010 kepada PT Ban Nasional untuk pasokan 12 bulan senilai Rp 5.000.000.000.",
        "Perjanjian kerjasama supply produk karet olahan dengan PT Otomotif Indonesia dengan volume 100 ton per tahun.",
        "Draft kontrak ekspor produk karet ke PT Trading Co. Ltd Singapore untuk pengiriman bulanan selama 1 tahun.",
        "Kontrak jasa custom manufacturing karet teknik dengan PT Engineering Solutions dengan nilai Rp 2.000.000.000.",
        "Perjanjian kerjasama eksklusif distribusi produk karet silikon medical ke rumah sakit dan klinik seluruh Indonesia.",
        "Kontrak penjualan produk karet tahan minyak untuk industri oil and gas kepada PT Energi Nusantara.",
        "Perjanjian supply bahan baku karet sintetis dari PT Almex ke PT Plastik Indonesia untuk produksi seal dan gasket.",
        "Kontrak kerjasama teknis dengan perusahaan Jerman untuk pengembangan produk karet high performance.",
    ]
    data.extend([(t, "Keluar", "Kontrak") for t in kontrak_keluar])
    
    # Nota Dinas - Keluar
    nd_keluar = [
        "Nota Dinas dari Direktur Produksi kepada seluruh kepala divisi perihal peningkatan target produksi Q2 2024 sebesar 15%.",
        "Nota Dinas perihal instruksi penghematan energi listrik dan air di area pabrik untuk menekan biaya operasional.",
        "Nota Dinas dari Manajer HRD kepada seluruh karyawan tentang pelaksanaan medical checkup tahunan.",
        "Nota Dinas perihal pelaksanaan uji kompetensi karyawan teknisi mesin produksi angkatan 2024.",
        "Nota Dinas dari Direktur Keuangan tentang prosedur baru pengajuan reimbursement dan cash advance.",
        "Nota Dinas perihal penunjukan tim task force untuk proyek efisiensi energi di lini produksi.",
        "Nota Dinas dari Manajer QC tentang implementasi prosedur inspeksi produk baru sesuai standar ISO.",
        "Nota Dinas perihal pelaksanaan program keselamatan kerja (K3) bulanan dan evaluasi kecelakaan kerja.",
    ]
    data.extend([(t, "Keluar", "Nota Dinas") for t in nd_keluar])
    
    # MoU - Keluar
    mou_keluar = [
        "Nota Kesepahaman (MoU) dari PT Almex Bintang Timur kepada PT Mitra Dagang tentang kerjasama distribusi produk karet ke Indonesia Timur.",
        "MoU yang diajukan kepada PT Teknologi Maju tentang kerjasama pengembangan produk karet nano untuk industri aerospace.",
        "Memorandum of Understanding dengan lembaga riset nasional tentang penelitian dan pengembangan bahan karet ramah lingkungan.",
        "MoU kerjasama dengan asosiasi industri karet tentang standarisasi mutu produk ekspor.",
        "Nota Kesepahaman yang diajukan kepada pemerintah daerah tentang program pelatihan vokasi untuk pemuda lokal.",
        "MoU kerjasama pendidikan dan pelatihan dengan politeknik negeri untuk program magang mahasiswa D3 teknik mesin.",
        "Memorandum of Understanding dengan perusahaan Jepang tentang joint venture produksi karet spesialti.",
        "MoU kerjasama dengan institusi penelitian tentang pengembangan produk karet berbasis nanoteknologi.",
    ]
    data.extend([(t, "Keluar", "MoU") for t in mou_keluar])
    
    # Lainnya - Keluar
    lainnya_keluar = [
        "Surat pemberitahuan kepada seluruh mitra bisnis tentang perubahan alamat kantor dan nomor kontak perusahaan.",
        "Surat undangan rapat umum pemegang saham tahunan (RUPST) PT Almex Bintang Timur untuk tahun buku 2023.",
        "Surat edaran kepada seluruh karyawan tentang kebijakan baru cuti dan work from home mulai April 2024.",
        "Surat pemberitahuan kepada pelanggan tentang kenaikan harga produk akibat kenaikan harga bahan baku global.",
        "Surat rekomendasi karyawan untuk keperluan beasiswa pendidikan lanjutan S2 manajemen bisnis.",
        "Surat pemberitahuan libur bersama dan cuti bersama Hari Raya Idul Fitri 1445 H kepada seluruh karyawan.",
        "Surat ucapan terima kasih kepada mitra bisnis atas kerjasama selama tahun 2023 yang produktif.",
        "Surat pemberitahuan perubahan struktur organisasi perusahaan efektif per 1 April 2024.",
    ]
    data.extend([(t, "Keluar", "Lainnya") for t in lainnya_keluar])
    
    texts = [d[0] for d in data]
    arah_labels = [d[1] for d in data]
    jenis_labels = [d[2] for d in data]
    
    return texts, arah_labels, jenis_labels
