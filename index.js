import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

/** util - encontra a primeira URL http(s) no texto */
function extractFirstUrl(text) {
  const re = /(https?:\/\/[^\s"'<>]+)/i;
  const m = text.match(re);
  return m ? m[0] : null;
}

/** faz fetch com retries simples */
async function fetchWithRetries(url, opts = {}, retries = 2, delayMs = 1000) {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s
      const resp = await fetch(url, {
        ...opts,
        signal: controller.signal
      });
      clearTimeout(timeout);
      return resp;
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

app.post("/", async (req, res) => {
  // ManyChat manda o key no body: { "key": "...." }
  const { key } = req.body || {};
  if (!key) {
    return res.status(400).json({ error: "Faltando 'key' no corpo da requisição." });
  }

  const target = `https://sstv.center/test.php?key=${encodeURIComponent(key)}`;

  try {
    const resp = await fetchWithRetries(target, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
      }
    }, 2, 1500);

    const text = await resp.text();

    console.log("Resposta SSTV (primeiros 800 chars):", text.slice(0, 800));

    // Se o retorno for claramente JSON simples com link, tenta parsear (caso)
    try {
      const maybeJson = JSON.parse(text);
      if (maybeJson && typeof maybeJson === "object") {
        if (maybeJson.link && typeof maybeJson.link === "string") {
          return res.status(200).json({ link: maybeJson.link.trim() });
        }
      }
    } catch (e) {
      // não era JSON — segue
    }

    // Se o texto começa com HTML, tenta extrair a primeira URL que apareça no HTML
    if (text.trim().toLowerCase().startsWith("<!doctype") || text.includes("<html")) {
      const extracted = extractFirstUrl(text);
      if (extracted) {
        console.log("Extraído do HTML:", extracted);
        return res.status(200).json({ link: extracted.trim() });
      }

      // se não encontramos URL, devolve erro com trecho do HTML para logs
      return res.status(500).json({
        error: "A SSTV retornou uma página HTML de proteção (Cloudflare). Não foi possível extrair o link.",
        snippet: text.slice(0, 1200) // só parte para logs
      });
    }

    // Caso comum: SSTV devolve o link em texto puro
    const possibleLink = text.trim();
    const urlFromText = extractFirstUrl(possibleLink) || possibleLink;
    if (urlFromText) {
      return res.status(200).json({ link: urlFromText.trim() });
    }

    // fallback
    return res.status(500).json({
      error: "Resposta inesperada da SSTV. Conteúdo retornado não contém link detectável.",
      snippet: text.slice(0, 1200)
    });

  } catch (err) {
    console.error("Erro ao chamar SSTV:", err);
    return res.status(500).json({
      error: "Erro interno ao tentar gerar o link (fetch).",
      detalhes: err.message
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
