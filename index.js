import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Proxy ativo e pronto para POST!");
});

app.post("/", async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ error: "Chave não enviada no corpo da requisição." });
    }

    const targetUrl = `https://sstv.center/test.php?key=${key}`;
    console.log("🔗 Requisição para:", targetUrl);

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const text = await response.text();
    return res.status(200).send(text);
  } catch (error) {
    console.error("❌ Erro no servidor:", error);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));

