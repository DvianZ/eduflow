# EduFlow Color Palette & Design Tokens

Dokumentasi resmi skema warna (*color palette*) dan token desain yang digunakan pada aplikasi EduFlow. Seluruh kode warna telah diselaraskan menggunakan basis **Slate Neutral** dan skala warna semantik yang konsisten untuk mendukung aksesibilitas (WCAG AA) pada Light Mode maupun Dark Mode.

---

## 1. Core Theme Tokens

Didefinisikan pada [`src/constants/theme.ts`](src/constants/theme.ts) dan diakses melalui hook [`useTheme()`](src/hooks/use-theme.ts) untuk mendukung peralihan dinamis antara Light Mode dan Dark Mode tanpa memicu kelelahan mata (*eye strain*).

| Token Key | Light Mode | Dark Mode | Fungsi / Penggunaan |
| :--- | :---: | :---: | :--- |
| `background` | `#FFFFFF` | `#0F172A` | Latar belakang (*canvas*) layar utama aplikasi. |
| `backgroundElement` | `#F1F5F9` | `#1E293B` | Latar belakang kartu (*card*), modul, container, dan badge netral. |
| `backgroundSelected` | `#E2E8F0` | `#334155` | Status komponen yang sedang aktif, ditekan, atau terseleksi. |
| `text` | `#0F172A` | `#F8FAFC` | Teks judul utama, angka metrik, dan konten primer dengan kontras tinggi yang lembut. |
| `textSecondary` | `#475569` | `#94A3B8` | Teks pendukung, deskripsi modul, sub-heading, dan caption. |

---

## 2. Brand & Role Accent Colors

Warna identitas aplikasi dan pembeda mode peran pengguna (*Role-based UI*) yang telah diseragamkan untuk menghindari tabrakan rona warna:

### A. Learner / Default Brand Blue
* **`#2563EB`** *(Blue 600)*:
  * Tombol aksi primer (*Primary Button*) di layar Login dan Registrasi.
  * Tab bar icon & tint aktif pada **Light Mode** saat pengguna berada dalam peran **Learner (Siswa)**.
  * Latar gradien utama logo EduFlow dan pill aktif.
* **`#3B82F6`** *(Blue 500)*:
  * Tab bar icon & tint aktif pada **Dark Mode** untuk peran **Learner (Siswa)**.
  * Sub-heading cohort dan teks aksen brand.
* **`#1D4ED8`** *(Blue 700)*:
  * Status tombol ditekan (*pressed/hover state*) pada tombol aksi primer Learner.

### B. Teacher / Educator Accent
* **`#7C3AED`** *(Violet 600)*:
  * Tombol aksi primer dan tab bar icon & tint aktif pada **Light Mode** saat pengguna berada dalam peran **Teacher (Pengajar)**.
  * Badge utama pengajar dengan kontras tinggi.
* **`#8B5CF6`** *(Violet 500)*:
  * Tab bar icon & tint aktif pada **Dark Mode** untuk peran **Teacher (Pengajar)**.
  * Kartu ringkasan penilaian (*gradebook recap*) dan chip instruktur.
* **`#6D28D9`** *(Violet 700)*:
  * Status tombol ditekan (*pressed/hover state*) dan aksen gradien header pada mode Teacher.

---

## 3. Semantic & Status Palette

Didefinisikan pada [`src/components/AlertModal.tsx`](src/components/AlertModal.tsx) serta digunakan di seluruh sistem notifikasi, submission grading, dan badge status. Setiap status memiliki pasangan warna utama untuk **Light Mode** (seri 600 agar teks/ikon tajam) dan **Dark Mode** (seri 500 agar tetap cerah):

| Status | Accent (Light / Dark) | Light Bg / Border | Dark Bg / Border | Penggunaan |
| :--- | :---: | :---: | :---: | :--- |
| **Success** | `#059669` *(Emerald 600)*<br>`#10B981` *(Emerald 500)* | `#ECFDF5`<br>`#A7F3D0` | `rgba(16, 185, 129, 0.16)`<br>`rgba(16, 185, 129, 0.35)` | Tugas lulus (*PASS*), modul tuntas, verifikasi berhasil. |
| **Error / Destructive** | `#DC2626` *(Red 600)*<br>`#EF4444` *(Red 500)* | `#FEF2F2`<br>`#FECACA` | `rgba(239, 68, 68, 0.16)`<br>`rgba(239, 68, 68, 0.35)` | Galat autentikasi, status revisi (*REDO*), tombol hapus / logout. |
| **Warning / Attention** | `#D97706` *(Amber 600)*<br>`#F59E0B` *(Amber 500)* | `#FFFBEB`<br>`#FDE68A` | `rgba(245, 158, 11, 0.16)`<br>`rgba(245, 158, 11, 0.35)` | Batas waktu tugas (*deadline*), tugas menunggu penilaian (*PENDING*). |
| **Confirmation** | `#0D9488` *(Teal 600)*<br>`#14B8A6` *(Teal 500)* | `#F0FDFA`<br>`#99F6E4` | `rgba(20, 184, 166, 0.16)`<br>`rgba(20, 184, 166, 0.35)` | Dialog konfirmasi aksi penting non-destruktif (mis. kirim nilai akhir, publikasi modul). |
| **Info / Notice** | `#0284C7` *(Sky 600)*<br>`#0EA5E9` *(Sky 500)* | `#F0F9FF`<br>`#BAE6FD` | `rgba(14, 165, 233, 0.16)`<br>`rgba(14, 165, 233, 0.35)` | Pengumuman sistem, petunjuk tour (*feature tour*), dan modal informasi umum. |

---

## 4. Surface & Slate Neutral Palette

Digunakan untuk styling modal kontemporer, efek *frosted glass*, dan navigasi yang selaras dengan **Core Theme Tokens**:

* **`#0F172A`** *(Slate 900)*: Teks judul utama pada modal dialog mode light & latar utama mode dark.
* **`#1E293B`** *(Slate 800)*: Background container modal dialog dan kartu pada mode dark.
* **`#334155`** *(Slate 700)*: Garis batas (*border*) modal dialog dan kartu pada mode dark.
* **`#E2E8F0`** *(Slate 200)*: Garis batas (*border*) kartu dan modal dialog pada mode light.
* **`#475569`** *(Slate 600)* & **`#94A3B8`** *(Slate 400)*: Teks deskripsi dan instruksi modal (Light / Dark).
* **`#64748B`** *(Slate 500)*: Ikon dan teks navigasi tab bar saat non-aktif (*inactive*).
* **`rgba(15, 23, 42, 0.85)`** & **`rgba(255, 255, 255, 0.85)`**: Background tab bar dengan efek *blur / translucent* yang menyatu dengan warna latar aplikasi.

---

## 5. Academic & Certificate Palette

Didefinisikan pada [`src/utils/certificatePdf.ts`](src/utils/certificatePdf.ts) untuk lembar ijazah & sertifikat digital:

| Hex Code | Nama Warna | Konteks Penggunaan |
| :--- | :--- | :--- |
| `#D97706` | Gold Amber | Border utama luar sertifikat & ornamen lambang. |
| `#B45309` | Dark Bronze | Garis putus-putus (*dashed line*) bingkai dalam sertifikat. |
| `#F59E0B` | Warm Gold | Aksen garis bawah nama penerima sertifikat (lebih tajam di atas kertas terang dibanding kuning pucat). |
| `#FEF3C7` | Pale Gold | Latar badge nomor sertifikat (*credential badge*). |
| `#FFFDF7` | Warm Parchment | Latar belakang kertas sertifikat (*ivory canvas*). |
| `#1E3A8A` | Deep Navy | Teks nama penerima sertifikat & institusi. |
| `#78350F` / `#92400E` | Rich Amber / Sepia | Sub-heading judul sertifikat resmi & teks nomor kredensial. |