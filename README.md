# Deptech Employee Management API

## Deskripsi

Aplikasi ini adalah API untuk manajemen data admin, employee, dan cuti yang dibangun menggunakan framework NestJS. Aplikasi ini menyediakan fitur-fitur berikut:
### Fitur Admin
- CRUD (Create, Read, Update, Delete) data Admin
- Login dan Autentikasi menggunakan JWT
- Update profil admin

### Fitur Employee
- CRUD data Employee
- List semua employee
- Detail employee

### Fitur Leave
- CRUD data Leave untuk setiap employee
- Validasi aturan cuti:
  - Maksimal 12 hari cuti per tahun
  - Maksimal 1 hari cuti per bulan
- List semua data cuti
- List data cuti per employee

## Teknologi yang Digunakan

- **Backend**: NestJS
- **Database**: MySQL
- **ORM**: Prisma
- **Autentikasi**: JWT
- **Validasi**: class-validator

## Persyaratan

- Node.js
- MySQL
- npm

## Instalasi

### 1. Clone repositori

```bash
git clone https://github.com/damario789/deptech-be.git
cd deptech-be
```

### 2. Install dependensi

```bash
npm install
```

### 3. Konfigurasi environment

Buat file `.env` di root project dengan isi seperti berikut:

```
DATABASE_URL="mysql://username:password@localhost:3306/deptech"
JWT_SECRET="your-secret-key"
BCRYPT_SALT_ROUNDS="10"
```

Sesuaikan `username`, `password`, dan nama database sesuai dengan konfigurasi MySQL Anda.

### 4. Migrate database

```bash
npx prisma migrate dev --name init
```

### 5. Generate Prisma client

```bash
npx prisma generate
```

### 6. Seed Database (Opsional)

Untuk mengisi database dengan data awal, gunakan perintah berikut:

```bash
npx prisma db seed
```

Setelah seeding berhasil, Anda dapat login menggunakan kredensial admin berikut:

```
Email: admin@deptech.com
Password: admin123
```

Data sample pegawai yang akan dibuat:

1. **John Doe**
   - Email: john@deptech.com
   - Phone: 08123456789
   - Address: Jakarta
   - Gender: MALE

2. **Jane Smith**
   - Email: jane@deptech.com
   - Phone: 08129876543
   - Address: Bandung
   - Gender: FEMALE

## Menjalankan Aplikasi

### Development mode

```bash
npm run start:dev
```


## Penggunaan API

### Authentication

Untuk mengakses sebagian besar endpoint, Anda memerlukan token JWT. Dapatkan token dengan melakukan login:

```
POST /admin/login
Content-Type: application/json

{
  "email": "admin@deptech.com",
  "password": "admin123"
}
```

Gunakan token pada header Authorization untuk setiap request:

```
Authorization: Bearer <access_token>
```

### Endpoints

#### Admin

- `POST /admin/register` - Register admin baru
- `POST /admin/login` - Login admin
- `GET /admin` - Get semua admin
- `GET /admin/:id` - Get admin by ID
- `PATCH /admin/:id` - Update admin
- `DELETE /admin/:id` - Delete admin

#### Employee

- `POST /employee` - Create employee baru
- `GET /employee` - Get semua employee
- `GET /employee/:id` - Get employee by ID
- `GET /employee/:id/leaves` - Get employee dengan data cuti
- `PATCH /employee/:id` - Update employee
- `DELETE /employee/:id` - Delete employee

#### Leave

- `POST /leave` - Create cuti baru
- `GET /leave` - Get semua cuti
- `GET /leave?employeeId=:id` - Get cuti by employee ID
- `GET /leave/:id` - Get cuti by ID
- `PATCH /leave/:id` - Update cuti
- `DELETE /leave/:id` - Delete cuti

## Menggunakan Postman

Collection Postman sudah tersedia untuk pengujian API. Gunakan collection yang telah disediakan untuk memudahkan pengujian.

### 1. Mengimpor Postman Collection dan Environment

1. **Download dan Install Postman**: Jika belum memiliki, download Postman dari [website resminya](https://www.postman.com/downloads/).

2. **Impor Collection dan Environment**:
   - Buka Postman
   - Klik tombol "Import" di pojok kiri atas
   - Pilih tab "File" > "Upload Files"
   - Pilih file collection dan environment Postman yang telah disediakan
   - Klik "Import"

3. **Aktifkan Environment**:
   - Klik dropdown environment di pojok kanan atas
   - Pilih environment yang baru diimpor

### 2. Autentikasi

1. **Login Admin**:
   - Di collection Deptech API, buka folder "Admin"
   - Klik request "Login"
   - Body request sudah diisi dengan kredensial default:
   ```json
   {
     "email": "admin@deptech.com",
     "password": "admin123"
   }
   ```
   - Klik "Send"
   - Access token akan otomatis disimpan ke environment variable `access_token` berkat script test yang sudah disediakan

2. **Verifikasi Token**:
   - Lihat environment variable dengan klik ikon "Environment" di pojok kanan atas
   - Pastikan variabel `access_token` sudah terisi dengan nilai token

3. **Autentikasi Otomatis**:
   - Collection sudah dikonfigurasi untuk menggunakan token secara otomatis pada semua request
   - Semua request sudah diatur untuk menggunakan autentikasi Bearer Token dengan variabel `{{access_token}}`

### 3. Mencoba Endpoints

#### Menggunakan Request yang Tersedia

Semua request sudah tersedia dalam collection yang diimpor. Berikut beberapa contoh request yang dapat digunakan:

1. **Employee Endpoints**:
   - List Employee (GET)
   - Create Employee (POST)
   - Get Employee by ID (GET)
   - Update Employee (PATCH)
   - Delete Employee (DELETE)

2. **Leave Endpoints**:
   - Create Leave (POST)
   - Get All Leaves (GET)
   - Get Leaves by Employee ID (GET)
   - Update Leave (PATCH)
   - Delete Leave (DELETE)

### 4. Melihat Response

Semua respons API akan mengikuti format standar:

```json
{
  "statusCode": 200,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

Jika terjadi error:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Error type"
}
```

## Aturan Bisnis

1. Setiap employee hanya dapat menggunakan maksimal 12 hari cuti dalam setahun.
2. Setiap employee hanya dapat menggunakan maksimal 1 hari cuti dalam satu bulan yang sama.
3. Permintaan cuti tidak dapat melewati batas bulan.

## Struktur Proyek

```
src/
├── admin/               # Module Admin
├── employee/            # Module Employee
├── leave/               # Module Leave
├── common/              # Shared utilities and helpers
├── prisma.service.ts    # Prisma service
├── app.module.ts        # Main application module
├── main.ts              # Application entry point
```

## Error Handling

Aplikasi ini menggunakan centralized error handling dengan PrismaErrorHandler untuk menangani berbagai jenis kesalahan database dan memberikan respons error yang konsisten. Semua respons API menggunakan format yang konsisten melalui ResponseInterceptor.

## License

[MIT](LICENSE)
