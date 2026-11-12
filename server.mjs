import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 10000;

const requireEnv = (name) => {
    const value = process.env[name]?.trim();
    if (!value) {
        console.error(`Variável de ambiente obrigatória ausente: ${name}`);
        process.exit(1);
    }
    return value;
};

const requirePath = (name) => {
    const value = requireEnv(name);
    if (!value.startsWith('/')) {
        console.error(`A variável ${name} deve começar com "/"`);
        process.exit(1);
    }
    return value;
};

const GITHUB_TOKEN = requireEnv('GITHUB_TOKEN');
const GITHUB_RAW_URL = requireEnv('GITHUB_RAW_URL');
const SW_RAW_URL = requireEnv('SW_RAW_URL');
const SW_RAW_INFO = requireEnv('SW_RAW_INFO');
const TOGGLE_API_URL = requireEnv('TOGGLE_API_URL');
const USER_AGENT = requireEnv('USER_AGENT');
const PIN_PATH = requirePath('PIN_PATH');
const TOGGLE_PATH = requirePath('TOGGLE_PATH');
const HEALTH_PATH = requirePath('HEALTH_PATH');

const GITHUB_HEADERS = {
    "Authorization": `Bearer ${GITHUB_TOKEN}`,
    "User-Agent": USER_AGENT
};

app.get(PIN_PATH, async (req, res) => {
    try {
        const sw = await fetch(SW_RAW_URL, { headers: GITHUB_HEADERS });

        if (!sw.ok) {
            throw new Error(`GitHub respondeu com status: ${sw.status} (swinfo)`);
        }

        res.set('Content-Type', 'text/plain; charset=utf-8');
        if ((await sw.text()).trim() !== SW_RAW_INFO) {
            return res.send("");
        }

        const response = await fetch(GITHUB_RAW_URL, { headers: GITHUB_HEADERS });

        if (!response.ok) {
            throw new Error(`GitHub respondeu com status: ${response.status}`);
        }

        const pin = await response.text();
        res.send(pin.trim());
    } catch (error) {
        console.error("Erro:", error.message);
        res.status(500).send("Erro ao obter PIN");
    }
});

app.get(TOGGLE_PATH, async (req, res) => {
    try {
        const response = await fetch(TOGGLE_API_URL, {
            headers: { ...GITHUB_HEADERS, "Accept": "application/vnd.github.raw" }
        });

        if (!response.ok) {
            throw new Error(`GitHub respondeu com status: ${response.status} (toggle)`);
        }

        res.set({ 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
        res.send((await response.text()).trim());
    } catch (error) {
        console.error("Erro:", error.message);
        res.status(500).send("Erro ao obter toggle");
    }
});

app.get(HEALTH_PATH, (req, res) => {
    res.status(200).send("OK");
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
