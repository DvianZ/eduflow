# EduFlow Cohort — Platform E-Learning Berbasis Angkatan (Cohort-Based)

[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020.svg?style=flat&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB.svg?style=flat&logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Zustand](https://img.shields.io/badge/State-Zustand%20%2B%20AsyncStorage-orange.svg?style=flat)](https://github.com/pmndrs/zustand)
[![Tests](https://img.shields.io/badge/Unit%20Tests-32%20Passed%20(100%25)-success.svg?style=flat)](https://jestjs.io)

**EduFlow Cohort** adalah aplikasi mobile e-learning modern yang mengadopsi metodologi pembelajaran berbasis angkatan (*cohort-based learning*) berstandar internasional (seperti Wadhwani Foundation dan program akselerator digital). 

Aplikasi ini dirancang untuk memberikan pengalaman belajar kolaboratif dengan kurikulum bertingkat yang terkunci (*sequential gatekeeper*), interaksi penilaian proyek dua arah antara pengajar dan siswa, penerbitan sertifikat digital terakreditasi, serta manajemen kelas yang fleksibel.

---

## 🌟 Sorotan Arsitektur: Full Local Dinamis (Zero-Config)

Aplikasi ini menggunakan pendekatan **Full Local Dinamis** bertenaga **Reactive State Engine & Local Persistent Storage (`AsyncStorage`)**:
- ✅ **Zero Setup**: Klien atau tim penguji tidak perlu membuat akun cloud, database eksternal, atau mengisi konfigurasi `.env` yang rumit. Cukup clone dan jalankan.
- ✅ **100% Berfungsi Mandiri**: Bekerja lancar bahkan saat perangkat berada dalam *Airplane Mode* (tanpa koneksi internet).
- ✅ **Data Persistence Tahan Restart**: Data registrasi, kelas baru, progres belajar, penilaian, sertifikat, dan notifikasi tetap tersimpan di memori lokal saat aplikasi ditutup atau HP di-restart.
- ✅ **Bebas Risiko Demo**: Menghilangkan risiko kegagalan presentasi akibat internet lambat atau server pihak ketiga *down*.

---

## 🚀 Fitur Unggulan

### 1. 👥 Sistem Autentikasi Multi-Peran & Isolasi Data
- **Dua Peran Utama**: **Pengajar (Teacher)** dan **Siswa (Learner)**.
- **Registrasi & Login Mandiri**: Form pendaftaran dinamis dengan validasi email, password (minimal 6 karakter), serta avatar otomatis.
- **Isolasi Data Antar Pengajar**: Pengajar A hanya melihat kelas dan antrean tugas yang dibimbingnya sendiri, tidak bercampur dengan Pengajar B.
- **Isolasi Progres Antar Siswa**: Progres materi, pengerjaan kuis, dan pengumpulan tugas antar siswa terpisah secara aman.
- **Demo Mode Switcher**: Tombol cepat untuk beralih antara akun Budi (Siswa) dan Pak Alex (Pengajar) untuk kemudahan demonstrasi.

### 2. 🏫 Manajemen Kelas & Siklus Cohort Pengajar
- **Pembuatan Kelas Baru**: Pengajar dapat membuat nama kursus, deskripsi, kategori, tingkat kesulitan, rentang tanggal cohort, dan batas kuota peserta.
- **Generator Kode Kelas Unik**: Sistem otomatis menghasilkan kode unik 6 karakter (contoh: `DEV-882`, `YOQ-217`) dengan tombol 1-klik salin (*copy to clipboard*).
- **Pengaturan & Siklus Kelas**:
  - Ubah kapasitas maksimal siswa kapan saja.
  - Perbarui tanggal mulai dan berakhirnya cohort.
  - Tutup pendaftaran kelas (*Status: Selesai/Ditutup*) sehingga siswa baru tidak bisa bergabung lagi, atau buka kembali saat cohort baru dimulai.
- **Siswa Bergabung via Kode Kelas**: Siswa cukup memasukkan kode kelas untuk mendaftar secara instan dengan validasi otomatis kapasitas kuota.

### 3. 🔒 Gerbang Kurikulum Sekuensial (Sequential Gatekeeper)
- **Aturan Buka Kunci Bertingkat**:
  - Materi perdana (Lesson 1.1) selalu terbuka untuk semua siswa.
  - Materi selanjutnya hanya akan terbuka setelah materi sebelumnya ditandai selesai.
  - Kuis Evaluasi Modul terkunci hingga seluruh materi di modul tersebut tuntas dipelajari.
  - Modul lanjutan dan Tugas Proyek terkunci sampai siswa berhasil **LULUS** kuis evaluasi modul sebelumnya (skor minimal 80%).

### 4. 📖 Pemutar Materi Kaya (Rich Content Lesson Viewer)
- **Markdown Reader Rapi**: Format bacaan terstruktur dengan subjudul beraksen, paragraf berjarak ideal, dan kartu sorotan materi.
- **Dark Code Blocks**: Blok kode pemrograman berskema warna gelap dengan tombol 1-klik salin sintaks (*Copy Code*).
- **Video Embed Card**: Tampilan kartu pemutar video untuk materi interaktif.
- **Sequential Footer Action**: Tombol cerdas di bagian bawah materi yang otomatis mengarahkan ke *"Lanjut ke Materi Berikutnya"* atau membuka *"Ambil Kuis Evaluasi"* saat materi modul telah selesai.

### 5. 📝 Pengumpulan Tugas Proyek & Alur Penilaian Dinamis
- **Pengumpulan Tugas**: Siswa dapat mengunggah catatan implementasi, link repository GitHub, atau berkas portofolio.
- **Antrean Pemeriksaan Pengajar**: Pengajar memiliki dasbor khusus untuk memeriksa tugas yang masuk.
- **Skor & Feedback Umpan Balik**: Pengajar dapat memberikan skor kuantitatif (0–100) serta umpan balik kualitatif tertulis.
- **Alur Permintaan Revisi**: Pengajar dapat meminta revisi (*REVISION_REQUIRED*). Siswa akan mendapatkan notifikasi alert untuk memperbaiki dan mengumpulkan ulang tugasnya.

### 6. 🎓 Kelulusan Terbobot & Sertifikat Digital Bergelar
- **Kalkulasi Kelulusan Terbobot**:
  $$\text{Nilai Akhir} = (30\% \times \text{Progres Materi}) + (30\% \times \text{Rata-rata Kuis}) + (40\% \times \text{Nilai Tugas})$$
- **Syarat Kelulusan**: Siswa dinyatakan **LULUS** jika mencapai nilai akhir $\ge 75$ dan menyelesaikan seluruh kurikulum.
- **Nomor Sertifikat Unik**: Sertifikat digital resmi diterbitkan dengan nomor verifikasi unik (contoh: `EDF-CERT-2026-402-9501`).
- **Kustomisasi Nama Lengkap & Gelar**: Siswa dapat mengatur nama resmi yang tercantum di sertifikat (misal: *Budi Santoso, S.Kom.*).

### 7. 📊 Ekspor Rekap Nilai Siswa ke CSV / Excel
- **Standar RFC 4180 dengan UTF-8 BOM (`\uFEFF`)**: Berkas `.csv` langsung terbaca rapi dengan kolom terpisah saat dibuka di Microsoft Excel maupun Google Sheets tanpa masalah encoding karakter.
- **Modal Pratinjau Interaktif**: Tabel rekap nilai interaktif dilengkapi filter kelas, ringkasan statistik (Total Peserta, Rerata Nilai, Tingkat Kelulusan), dan tombol salin ke papan klip (*Clipboard*).

### 8. 🔔 Pusat Notifikasi In-App (Notification Center)
- **Badge Counter Real-Time**: Ikon lonceng di header dengan indikator angka merah saat ada notifikasi belum dibaca.
- **Pemicu Otomatis**:
  - Notifikasi saat tugas dinilai atau diminta revisi oleh pengajar.
  - Notifikasi siaran pengumuman baru yang diposting ke kelas.
  - Notifikasi bagi pengajar saat ada siswa baru mendaftar atau mengumpulkan tugas.
- **Filter Tabs**: Tab *Semua Notifikasi* dan *Belum Dibaca*, tombol *Tandai Dibaca*, serta tombol navigasi cepat ke layar terkait.

### 9. 🔥 Gamifikasi & Pemantauan Konsistensi
- **Daily Streak Counter**: Menghitung hari aktif belajar berturut-turut.
- **Experience Points (XP)**: Reward XP untuk setiap penyelesaian materi, kuis, dan pengumpulan tugas.

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Framework** | Expo SDK 54 / React Native 0.76 | Arsitektur modern mobile cross-platform (Android & iOS) |
| **Bahasa** | TypeScript 5.3 | Jaminan keandalan tipe statis di seluruh kode |
| **Navigasi** | Expo Router (v4) | File-based routing berbasis tab & stack navigator |
| **State Management** | Zustand + Middleware Persist | Manajemen state reaktif performa tinggi |
| **Penyimpanan Lokal** | `@react-native-async-storage/async-storage` | Persistensi data lokal tanpa ketergantungan server eksternal |
| **Ikon & Desain** | `@expo/vector-icons` (Ionicons) | UI modern, responsif, mendukung Dark & Light Mode |
| **Testing** | Jest + `@testing-library/react-native` | 32 skenario pengujian logika bisnis terotomatisasi (100% pass) |

---

## 📦 Panduan Menjalankan Proyek

### Prasyarat
- [Node.js](https://nodejs.org/) versi LTS (v18 atau lebih baru).
- npm atau yarn.

### Langkah Menjalankan Aplikasi
1. **Clone repositori**:
   ```bash
   git clone <url-repositori-anda>
   cd revisi
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan development server**:
   ```bash
   npx expo start
   ```

4. **Buka aplikasi**:
   - Tekan `w` di terminal untuk membuka versi **Web Browser** di `http://localhost:8081`.
   - Atau scan QR code menggunakan aplikasi **Expo Go** di HP Android/iOS Anda.

---

## 🔑 Akun Demo Siap Pakai

Aplikasi sudah dilengkapi dengan akun demo bawaan untuk kemudahan pengujian:

| Peran | Email | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Siswa (Learner)** | `budi@eduflow.id` | `demo123` | Terdaftar di 3 kelas cohort, memiliki 1 sertifikat kelulusan |
| **Pengajar (Teacher)** | `alex@eduflow.id` | `demo123` | Mengampu kelas React Native & DevOps Cloud Native |

> 💡 *Catatan: Anda juga dapat mendaftar akun baru kapan saja melalui tombol **Daftar Akun Baru** di halaman Login.*

---

## 📱 Panduan Pembuatan Berkas APK Android (Standalone)

Untuk mem-build berkas APK mandiri yang bisa langsung di-install di HP Android tanpa perlu laptop atau dev server:

1. Pastikan Anda telah memiliki akun di [Expo](https://expo.dev) dan login via terminal:
   ```bash
   npx eas-cli login
   ```
2. Buat profil build APK di file `eas.json` (sudah terkonfigurasi):
   ```json
   {
     "build": {
       "preview": {
         "android": {
           "buildType": "apk"
         }
       }
     }
   }
   ```
3. Jalankan perintah build cloud gratis dari EAS:
   ```bash
   npx eas-cli build -p android --profile preview
   ```
4. Setelah proses selesai, unduh file `.apk` langsung dari tautan dashboard EAS yang diberikan dan install di perangkat Android Anda.

---

## 🧪 Pengujian Kualitas Kode (Quality Assurance)

Proyek ini telah lulus seluruh standar verifikasi kualitas kode:

```bash
# Menjalankan 32 unit test logika bisnis & gerbang sekuensial
npm test

# Pengecekan tipe statis TypeScript (0 error)
npx tsc --noEmit

# Pengecekan kode gaya & linter Expo (0 error)
npx expo lint
```

---

## 📂 Struktur Direktori Utama

```
revisi/
├── __tests__/                  # Unit testing Jest (32 skenario pengujian logika)
├── src/
│   ├── app/                    # Halaman & Routing (Expo Router)
│   │   ├── (tabs)/             # Tab Navigasi: Dashboard, Silabus, Penilaian, Profil
│   │   ├── class-manager.tsx   # Panel Pengelolaan & Siklus Kelas Pengajar
│   │   ├── login.tsx           # Layar Masuk
│   │   └── register.tsx        # Layar Pendaftaran Akun Baru
│   ├── components/             # Komponen UI Reusable
│   │   ├── DemoHeader.tsx      # Header universal + switch role + lonceng notifikasi
│   │   ├── NotificationModal.tsx # Pusat Notifikasi In-App interaktif
│   │   └── ...
│   ├── data/
│   │   └── mockData.ts         # Initial seed data (kursus, cohort, kurikulum, kuis)
│   ├── store/
│   │   ├── useAuthStore.ts     # Manajemen autentikasi & registrasi (AsyncStorage)
│   │   └── useElearningStore.ts# Mesin bisnis e-learning utama (AsyncStorage)
│   ├── types/                  # Definisi TypeScript interface
│   └── utils/
│       ├── exportGradebook.ts  # Mesin ekspor rekapitulasi nilai CSV / Excel
│       └── lockEngine.ts       # Logika gerbang buka kunci sekuensial & kelulusan
└── README.md                   # Dokumentasi resmi proyek
```

---

*Dikembangkan dengan standar arsitektur mobile clean code untuk kebutuhan pengujian, demonstrasi interaktif, dan kesiapan produksi.*
