const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

app.get('/api/videos', async (req, res) => {
  try {
    const jsonPath = path.join(__dirname, 'videos.json');
    const data = await fs.readFile(jsonPath, 'utf8');
    const videos = JSON.parse(data);
    res.set('Cache-Control', 'public, max-age=3600');
    return res.json(videos);
  } catch (err) {
    console.error('Erro ao ler videos.json:', err);
    return res.status(500).json([]);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
