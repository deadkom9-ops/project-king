# Project King — Project Management & Monitoring System

Aplikasi manajemen project, task, milestone, dan persetujuan progres (_progress approval_) berbasis web dengan isolasi workspace antar perusahaan (**Company Group**). Dibangun menggunakan **Laravel 13**, **Inertia.js**, **React 19**, dan **Tailwind CSS 4**.

---

## Fitur Utama

1. **Isolasi Grup Perusahaan (`CompanyGroup`)**
    - Setiap perusahaan/organisasi memiliki workspace terpisah dengan kode ID unik berformat **`NAMA-GRUP-KODE6DIGIT`** (contoh: `PT-MAJU-JAYA-A7X9K2`).
    - User hanya dapat melihat project dan menambahkan anggota tim yang berada di dalam grup perusahaan yang sama.
    - User dapat bergabung ke grup perusahaan saat **Register** menggunakan kode ID grup, atau membuat/bergabung grup melalui **Dashboard / Sidebar** setelah login.

2. **Manajemen Project & Milestone**
    - Pembuatan project lengkap dengan deskripsi, rentang tanggal, status (`Draft`, `Aktif`, `Ditunda`, `Selesai`, `Dibatalkan`), prioritas (`Rendah`, `Sedang`, `Tinggi`, `Kritis`), dan anggaran.
    - Pengelompokan tugas ke dalam fase **Milestone** yang terukur progresnya.

3. **Task & Pembobotan Progres**
    - Setiap task memiliki bobot (`weight`) dan _assignee_ (anggota tim yang ditugaskan).
    - Progres project dan milestone dihitung otomatis berdasarkan rata-rata tertimbang (_weighted average_) dari seluruh task.

4. **Submit Progress & Sistem Approval**
    - Anggota tim dapat mengirimkan laporan progres (0–100%), catatan pengerjaan, serta lampiran bukti (`.jpg`, `.jpeg`, `.pdf` maks 5MB).
    - Manager/Pimpinan dapat melakukan **Approve**, **Reject**, atau meminta **Revisi** (lengkap dengan catatan revisi yang tampil di task).

5. **Dashboard Analitik & Notifikasi**
    - Ringkasan statistik project, task, _pending approvals_, grafik batang progres project aktif, dan diagram lingkaran status task.
    - Notifikasi internal saat ada progres disubmit, di-approve, ditolak, atau diminta revisi.

6. **Role-Based Access Control (RBAC)**
    - Mendukung hierarki role: `admin`, `direktur`, `wakil_direktur`, `kepala_bidang`, `kepala_unit`, `project_manager`, dan `member`.

---

## Alur Penggunaan Aplikasi

1. **Registrasi & Login**
    - Pengguna mendaftar di halaman `/register`.
    - Pengguna dapat langsung memasukkan **Kode ID Grup** (opsional) jika sudah memiliki grup perusahaan dari rekannya, atau mengosongkannya.
    - Setelah registrasi berhasil, pengguna diarahkan ke halaman `/login` untuk masuk.

2. **Setup / Gabung Grup Perusahaan**
    - Jika saat daftar belum bergabung ke grup, pada **Dashboard** akan muncul panel untuk **Buat Grup Baru** (cukup isi nama perusahaan, sistem otomatis membuatkan 6 digit kode acak unik dan menaikkan role pembuat menjadi `Project Manager`) atau **Gabung Grup** dengan kode ID.
    - Kode ID Grup (`NAMA-GRUP-6DIGIT`) dapat disalin dari Dashboard atau Sidebar untuk dibagikan ke rekan satu perusahaan.

3. **Pembuatan Project & Penugasan**
    - Buat project di menu **Projects → Buat Project Baru**, lalu pilih anggota tim (hanya menampilkan user dari grup perusahaan yang sama).
    - Tambahkan **Milestone** dan **Task** di halaman detail project, lalu assign task ke anggota tim terkait.

4. **Pelaporan Progres & Approval**
    - Anggota tim membuka task yang ditugaskan dan melakukan **Submit Progress** beserta catatan/bukti file.
    - Status task berubah menjadi **Review** dan masuk ke daftar **Approvals**.
    - Project Manager atau pimpinan terkait meninjau dan memilih **Approve**, **Revisi**, atau **Reject**. Jika di-approve, persentase progres task dan project otomatis diperbarui.

---

## Tech Stack

- **Backend:** PHP 8.3+, Laravel 13, Inertia.js Laravel
- **Frontend:** React 19, Tailwind CSS 4, Vite 8, Recharts, Lucide React
- **Database:** MySQL / MariaDB

---

## Langkah Instalasi

### Prasyarat

- PHP >= 8.3
- Composer
- Node.js & NPM
- MySQL / MariaDB (misal via Laragon, XAMPP, atau Docker)

### 1. Clone Repository

```bash
git clone <url-repository-anda>
cd project-king
```

### 2. Install Dependency Backend & Frontend

```bash
composer install
npm install
```

### 3. Konfigurasi Environment (`.env`)

Salin file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Buka file `.env` dan sesuaikan koneksi database Anda:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=project_one
DB_USERNAME=root
DB_PASSWORD=
```

_(Pastikan database kosong bernama `project_one` atau sesuai `DB_DATABASE` sudah dibuat di MySQL)._

### 4. Generate Key & Jalankan Migrasi + Seeder

```bash
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
```

Perintah `php artisan migrate --seed` akan membuat seluruh tabel (termasuk `company_groups`, `users`, `projects`, `milestones`, `tasks`, `progress_updates`, dll.) dan mengisi data demo awal.

### 5. Build Aset Frontend & Jalankan Server

Untuk mode **development**:

```bash
# Terminal 1: Jalankan Vite dev server
npm run dev

# Terminal 2: Jalankan Laravel server
php artisan serve
```

Atau untuk **production build** (cukup sekali build jika menggunakan Laragon/Nginx/Apache):

```bash
npm run build
```

Akses aplikasi di browser melalui `http://127.0.0.1:8000` (atau virtual host Laragon Anda, misal `http://project-king.test`).

---

## Akun Demo (Hasil `DemoSeeder`)

Seluruh akun demo tergabung dalam grup **`Project King Demo`** dengan Kode ID Grup: **`PROJECT-KING-DEMO-DEMO01`** dan password default: **`password`**.

| Role            | Email                      | Password   |
| --------------- | -------------------------- | ---------- |
| Admin           | `admin@projectking.com`    | `password` |
| Direktur        | `direktur@projectking.com` | `password` |
| Wakil Direktur  | `wadir@projectking.com`    | `password` |
| Kepala Bidang   | `kabid@projectking.com`    | `password` |
| Kepala Unit     | `kaunit@projectking.com`   | `password` |
| Project Manager | `pm@projectking.com`       | `password` |
| Member (Faisal) | `faisal@projectking.com`   | `password` |
| Member (Gita)   | `gita@projectking.com`     | `password` |
| Member (Hasan)  | `hasan@projectking.com`    | `password` |
