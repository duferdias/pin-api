import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 10000;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_RAW_URL = "https://raw.githubusercontent.com/duferdias/pin-repo/main/code";

app.get('/get-pin', async (req, res) => {
    try {
        const response = await fetch(GITHUB_RAW_URL, {
            headers: {
                "Authorization": `Bearer ${GITHUB_TOKEN}`,
                "User-Agent": "Pin-API-Render"
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub respondeu com status: ${response.status}`);
        }

        const pin = await response.text();
        res.set('Content-Type', 'text/plain; charset=utf-8');
        res.send(pin.trim());
    } catch (error) {
        console.error("Erro:", error.message);
        res.status(500).send("Erro ao obter PIN");
    }
});

app.get('/health', (req, res) => {
    res.status(200).send("OK");
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
