import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());

// THE UPGRADE: We added a 50mb limit so your users can upload high-quality photos!
app.use(express.json({ limit: '50mb' })); 

app.use(express.static('./'));

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: '.' });
});

const ai = new GoogleGenAI({});

app.post('/api/chat', async (req, res) => {
    try {
        // Grab the text, image, and language state from your new webpage design
        const { prompt, imageBase64, mimeType, isHindi } = req.body;

        // Give the AI its "Nivi" personality based on the English/Hindi toggle
        const sysPrompt = isHindi ? 
            "You are Nivi, a trusted Indian health app. Respond ONLY in simple Hindi. Be warm, clear, and focused on Indian healthcare. Keep answers concise." : 
            "You are Nivi, a trusted Indian health app. Respond in simple clear English. Be warm, practical, and focused on Indian food, lifestyle, and healthcare. Keep answers concise.";

        // Package the image and text together if an image exists
        let aiContents = prompt;
        if (imageBase64) {
             aiContents = [
                 prompt, 
                 { inlineData: { data: imageBase64, mimeType: mimeType } }
             ];
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', 
            contents: aiContents,
            config: {
                systemInstruction: sysPrompt // Injecting the Nivi personality
            }
        });
        
        res.json({ text: response.text });
        
    } catch (error) {
        console.error("Real Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Keeping it on 3001 so we don't run into the old ghost servers
const PORT = 3001; 
app.listen(PORT, () => {
    console.log(`🚀 Nivi Server running! Open your browser to http://localhost:${PORT}`);
});
// THE VERCEL FIX: This tells Vercel how to read your Express app
export default app;