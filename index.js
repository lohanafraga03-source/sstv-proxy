import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // se usar node >= 18, fetch já existe; ajuste conforme seu ambiente

const app = express();
app.use(cors());
app.use(express.json());

// util - sleep
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// util - tenta fetch com retries exponenciais
async function fetchWithRetries(url, options = {}, attempts = 3, initialDelay = 800) {
  let delay = initialDelay;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      if (i === attempts - 1) throw err;
      await wait(delay);
      delay *= 2;
    }
  }
}

// rota GET só pra checar
app.get("/", (req, res) => {
  res.send("✅ Proxy ativo e pronto para POST!");
});

// rota POST que ManyChat chama
app.post("/", async (req, res) => {
  try {
    const API_KEY = process.env.SSTV_API_KEY;
    if (!API_KEY) {
      console.error("SSTV_API_KEY não configurada");
      return res.status(500).json({
        version: "v2",
        content: { messages: [{ type: "text", text: "❌ Erro: SSTV_API_KEY não configurada no servidor." }] }
      });
    }

    // monta a URL da SSTV (ajuste se o endpoint for diferente)
    const sstvUrl = `https://sstv.center/test.php?key=${API_KEY}`;

    // faz a chamada com retries
    const response = await fetchWithRetries(sstvUrl, { method: "GET", redirect: "follow" }, 4, 800);

    // pega o texto bruto retornado pela SSTV (muitos endpoints SSTV retornam texto/HTML)
    const data = await response.text();
    console.log("📦 Resposta da SSTV (primeiros 500 chars):", data.slice(0, 500));

    // ----- DETECTAR BLOQUEIO -----
    // se a resposta contiver um HTML de challenge/DOCTYPE/Cloudflare, detecta e retorna erro
    const lowered = data.toLowerCase();
    if (lowered.includes("<!doctype") || lowered.includes("cloudflare") || lowered.includes("just a moment")) {
      console.warn("⚠️ SSTV retornou conteúdo HTML (possível bloqueio).");
      return res.status(500).json({
        error: "A SSTV bloqueou o acesso automático. Tente novamente em instantes.",
        resposta: data.slice(0, 4000) // opcional: só pra debug no ManyChat (cuidado com tamanho)
      });
    }

    // ----- TENTAR EXTRAIR O LINK -----
    // Algumas SSTV retornam diretamente uma URL plain text ou dentro de um texto.
    // Vamos tentar extrair uma URL usando regex
    const urlRegex = /(https?:\/\/[^\s"'<>]+)/i;
    const m = data.match(urlRegex);
    if (m && m[0]) {
      const link = m[0].trim();
      console.log("🔗 Link extraído:", link);

      // Retorna JSON compatível com ManyChat mapping: { link: "..." }
      return res.status(200).json({ link });
    }

    // se não encontrou link, retorna o texto "limpo" (trim) como fallback
    const fallback = data.trim();
    if (fallback) {
      console.log("ℹ️ Resposta sem link, retornando texto bruto (trim).");
      return res.status(200).json({ link: fallback });
    }

    // nenhum dado útil
    return res.status(500).json({
      version: "v2",
      content: {
        messages: [{ type: "text", text: "❌ Erro ao gerar o link, tente novamente em instantes." }]
      }
    });

  } catch (error) {
    console.error("⚠️ Erro ao gerar link:", error);
    return res.status(500).json({
      version: "v2",
      content: {
        messages: [{ type: "text", text: "❌ Erro ao gerar o link, tente novamente em instantes." }]
      }
    });
  }
});

// inicia servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
