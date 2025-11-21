import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const app = express();
const port = 3001;

app.use(cors({
  origin: '*'
}));
app.use(express.json());

// --- DIAGNOSTICS ---
console.log("--- SERVER STARTUP DIAGNOSTICS ---");
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log(`✅ Found .env file at: ${envPath}`);
} else {
  console.error(`❌ .env file NOT found at: ${envPath}`);
  console.error("   Please create a file named .env in this folder.");
}

const apiKey = process.env.API_KEY;

if (apiKey) {
  const maskedKey = apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4);
  console.log(`✅ API_KEY loaded: ${maskedKey}`);
} else {
  console.error(`❌ API_KEY is undefined. Check your .env file content.`);
}
console.log("------------------------------------");

// Initialize Gemini Client
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

app.post('/api/chat', async (req, res) => {
  console.log(`\n📩 Received POST /api/chat`);
  
  const { message, history, systemInstruction } = req.body;

  // 1. Validate Server Config
  if (!ai || !apiKey) {
    console.error("❌ Error: Server has no API Key configured.");
    return res.status(500).json({ error: "Server missing API Key. Check server terminal." });
  }

  // 2. Validate Request
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // 3. Sanitize History
    const sanitizedHistory = (history || []).map(item => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: item.parts.map(p => ({ text: p.text || '' }))
    }));

    console.log(`🤖 Sending request to Gemini (Model: gemini-2.5-flash)...`);

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
      },
      history: sanitizedHistory
    });

    const result = await chat.sendMessageStream({ message: message });
    
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of result) {
      const text = chunk.text;
      if (text) {
        res.write(text);
      }
    }
    
    res.end();
    console.log("✅ Response sent successfully.");

  } catch (error) {
    console.error('❌ GEMINI API ERROR:', error.message);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Gemini API Request Failed', 
        details: error.message 
      });
    } else {
      res.end();
    }
  }
});

app.listen(port, () => {
  console.log(`\n🚀 Server listening at http://localhost:${port}`);
});