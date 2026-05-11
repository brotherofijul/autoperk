# AutoPerk

AutoPerk adalah CLI sederhana untuk Rival Regions yang berjalan di Termux.

Fitur:
- Menyimpan akun otomatis dari browser
- Auto perk Strength, Education, dan Endurance
- Mendukung Money dan Gold
- Auto update UserScript dari GitHub

---

# Requirements

Aplikasi yang dibutuhkan:

- Termux
- Via

Gunakan Termux dari F-Droid, bukan Play Store. Karena versi Play Store sudah tua dan ditinggalkan seperti project open source tanpa maintainer.

---

# Install Termux

## Download Termux

Install dari:

```txt
https://f-droid.org/packages/com.termux/
```

---

# Setup Termux

## 1. Update Package

Buka Termux lalu jalankan:

```bash
pkg update -y && pkg upgrade -y
```

---

## 2. Install Node.js dan Git

```bash
pkg install nodejs git -y
```

---

## 3. Cek Versi Node.js

```bash
node -v
```

Minimal Node.js versi:

```txt
v22
```

---

# Install AutoPerk

Install langsung dari GitHub:

```bash
npm i -g github:brotherofijul/autoperk
```

Tunggu sampai selesai.

---

# Menjalankan Server

Jalankan server:

```bash
autoperk -SV
```

Jika berhasil:

```txt
Server running on port 3000
```

Penting:
- Jangan tutup Termux
- Jangan swipe aplikasi dari recent apps
- Jangan force close Termux

Karena server berjalan di Termux. Jika Termux mati, server ikut mati. Komputer itu sangat patuh tapi tidak punya inisiatif.

---

# Setup Via

## Install Via

Install Via dari Play Store.

---

# Install UserScript

## 1. Buka Pengaturan Skrip

Buka Via, lalu masuk ke:

```txt
Menu → Pengaturan → Skrip
```

---

## 2. Tambahkan Script dengan URL

Pilih:

```txt
Tambah Script dengan URL
```

Lalu masukkan URL berikut:

```txt
https://raw.githubusercontent.com/brotherofijul/autoperk/main/autoperk.user.js
```

Lalu install script.

---

# Login Rival Regions

Pastikan server sudah berjalan:

```bash
autoperk -SV
```

Setelah itu buka:

```txt
https://m.rivalregions.com
```

Login akun seperti biasa.

Jika berhasil, akun otomatis tersimpan ke database.

Contoh log di Termux:

```txt
=== Session Updated ===
Player ID : 123456
Timestamp : 11/05/2026 21:30
```

---

# Melihat Daftar Akun

Sebelum menjalankan auto perk, wajib cek ID akun terlebih dahulu.

Jalankan:

```bash
autoperk -AL
```

Contoh hasil:

```txt
=== Account List ===

ID        : 123456
Timestamp : 11/05/2026 21:30
```

Gunakan ID tersebut untuk menjalankan auto perk.

---

# Menjalankan Auto Perk

Penting:
- Jalankan di terminal yang berbeda
- Jangan hentikan server
- Server `-SV` harus tetap hidup

Karena:
- Terminal pertama digunakan untuk server
- Terminal kedua digunakan untuk auto perk

Jika hanya punya 1 session Termux:
- Swipe dari kiri
- Pilih `NEW SESSION`

Manusia akhirnya menemukan bahwa satu terminal tidak bisa menjalankan dua proses foreground sekaligus. Sebuah penemuan besar dalam sejarah komputasi.

---

# Format Command

```bash
autoperk -S <id> <perk> <payment>
```

---

# Perk List

| Code | Perk |
|---|---|
| str | Strength |
| edu | Education |
| end | Endurance |

---

# Payment List

| Code | Payment |
|---|---|
| m | Money |
| g | Gold |

---

# Contoh Penggunaan

## Strength menggunakan Money

```bash
autoperk -S 123456 str m
```

---

## Education menggunakan Gold

```bash
autoperk -S 123456 edu g
```

---

## Endurance menggunakan Money

```bash
autoperk -S 123456 end m
```

---

# Output Success

Jika berhasil:

```txt
[11/05/2026 21:40] Success | Education | Gold
```

Jika gagal:

```txt
[11/05/2026 21:40] Failed | Error message
```

---

# Menampilkan Bantuan

```bash
autoperk -H
```

---

# Struktur Penggunaan yang Benar

## Terminal 1

Jalankan server:

```bash
autoperk -SV
```

Biarkan tetap hidup.

---

## Terminal 2

Cek account list:

```bash
autoperk -AL
```

---

## Terminal 2

Jalankan auto perk:

```bash
autoperk -S 123456 str m
```

---

# Troubleshooting

## `autoperk: command not found`

Jalankan:

```bash
hash -r
```

Jika masih error:

```bash
npm i -g github:brotherofijul/autoperk
```

---

## Akun tidak masuk database

Pastikan:
- Server aktif
- UserScript aktif
- Login di `m.rivalregions.com`
- Tidak menggunakan incognito mode

---

## Server tidak berjalan

Pastikan command:

```bash
autoperk -SV
```

masih aktif dan tidak tertutup.

---

# License

ISC
