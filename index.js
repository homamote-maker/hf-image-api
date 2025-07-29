require('dotenv').config(); // Load .env variables

const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

app.post('/generate-image', async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: 'Missing imageUrl in body' });
  }

  try {
    const hfResponse = await fetch(
      'https://api-inference.huggingface.co/models/ilkerzgi/Overlay-Kontext-Dev-LoRA',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: imageUrl,
          parameters: {
            prompt: 'make this image scary',
          },
        }),
      }
    );

    if (!hfResponse.ok) {
      const errText = await hfResponse.text();
      return res.status(hfResponse.status).json({ error: 'HF API error', detail: errText });
    }

    const arrayBuffer = await hfResponse.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    res.set('Content-Type', 'image/png');
    res.send(Buffer.from(base64Image, 'base64'));
  } catch (error) {
    res.status(500).json({ error: 'Server error', detail: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
