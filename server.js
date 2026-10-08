const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb' }));
app.use(express.static(path.join(__dirname, '.')));

if (!process.env.GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY belum diatur. Pastikan file .env sudah dibuat.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { grade, topic, count, difficulty } = req.body;

    if (!topic || !count) {
      return res.status(400).json({ error: 'Topic dan count diperlukan' });
    }

    const prompt = `Buatkan ${count} soal pilihan ganda tingkat ${grade} dengan topik "${topic}" dan tingkat kesulitan ${difficulty}. 

Wajib kembalikan HANYA format JSON array valid seperti contoh berikut (TANPA teks tambahan atau markdown):
[
  {
    "id": 1,
    "soal": "Pertanyaan soal di sini?",
    "opsi": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
    "jawabanBenar": 0,
    "pembahasan": {
      "konsep": "Penjelasan konsep yang ditest",
      "langkah": "Langkah-langkah penyelesaian",
      "tips": "Tips dan trik untuk menjawab soal serupa"
    }
  }
]

PENTING: Hanya return JSON, tidak ada teks lain!`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Tidak bisa parse JSON dari response Gemini');
    }

    const questions = JSON.parse(jsonMatch[0]);
    res.json(questions);
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({
      error: 'Gagal membuat kuis',
      details: error.message
    });
  }
});

app.post('/api/analyze-homework', async (req, res) => {
  try {
    const { image, mimeType, customPrompt } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image base64 diperlukan' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Analisis foto soal/tugas berikut dan berikan penjelasan lengkap:

${customPrompt ? `Pertanyaan tambahan: ${customPrompt}\n` : ''}

Berikan jawaban dalam format markdown dengan struktur:
1. **Identifikasi Soal** - Apa yang ditanyakan
2. **Langkah-Langkah Penyelesaian** - Cara step-by-step
3. **Kesimpulan & Jawaban Akhir** - Hasil final

Jelaskan dengan detail dan mudah dipahami untuk siswa.`;

    const imagePart = {
      inlineData: {
        data: image,
        mimeType: mimeType || 'image/jpeg'
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const analysis = result.response.text();
    res.json({ analysis });
  } catch (error) {
    console.error('Error analyzing homework:', error);
    res.status(500).json({
      error: 'Gagal menganalisis foto',
      details: error.message
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════╗
  ║   🎓 EduGen AI - Backend Server Running   ║
  ╚════════════════════════════════════════════╝

  ✅ Server berjalan di: http://localhost:${PORT}
  🔌 API Quiz: POST http://localhost:${PORT}/api/generate-quiz
  📷 API Scanner: POST http://localhost:${PORT}/api/analyze-homework
  `);
});
