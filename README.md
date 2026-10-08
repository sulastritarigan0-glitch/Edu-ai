# 🎓 EduGen AI - Student Learning & Exam Assistant

Platform pembelajaran interaktif berbasis AI yang menggunakan Google Gemini API untuk membuat kuis otomatis dan menganalisis foto tugas.

## Fitur Utama

- Generator Kuis Otomatis
- Scanner Tugas
- Dark Mode
- Backend aman dengan API key di server

## Instalasi

### 1. Install dependencies
```bash
npm install
```

### 2. Buat file `.env`
```bash
cp .env.example .env
```

Lalu isi nilai API key Anda di `.env`:
```env
GEMINI_API_KEY=your_actual_api_key_here
PORT=3000
```

### 3. Jalankan server
```bash
npm start
```

Akses aplikasi di:
```bash
http://localhost:3000
```

## Keamanan

- Jangan pernah commit file `.env`
- Jangan share API key di GitHub public
- API key harus dipakai di backend, bukan di frontend HTML

## Struktur File

```bash
Edu-ai/
├── index.html
├── server.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```
