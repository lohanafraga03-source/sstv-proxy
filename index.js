import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// URL base da SSTV
const SSTV_BASE_URL = "https://sstv.center/gerar-teste-exemplo";

// Rota principal
app.post("/", async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ error: "Chave (key) não fornecida." });
    }

    console.log("🔑 Chave recebida:", key);

    // Faz a requisição para a SSTV
    const response = await fetch(SSTV_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ key }),
    });

    const data = await response.text();

    // Verifica se o retorno é um link válido
    const linkMatch = data.match(/https?:\/\/[^\s"]+/);
    const link = linkMatch ? linkMatch[0] : null;

    if (!link) {
      console.error("❌ Nenhum link encontrado na resposta:", data);
      return res.status(500).json({
        error: "Não foi possível gerar o link de teste automaticamente.",
        resposta: data,
      });
    }

    console.log("✅ Link encontrado:", link);

    // Retorna o link para o ManyChat
    res.status(200).json({ link: link.trim() });

  } catch (error) {
    console.error("⚠️ Erro ao gerar o teste:", error);
    res.status(500).json({
      error: "Falha ao gerar o teste IPTV.",
      detalhes: error.message,
    });
  }
});

// Inicializa o servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
