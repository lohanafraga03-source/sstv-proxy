import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Verificação básica
app.get("/", (req, res) => {
  res.send("✅ Proxy ativo e pronto para gerar links SSTV!");
});

// 🔹 Rota POST — chamada pelo ManyChat
app.post("/", async (req, res) => {
  try {
    console.log("📩 Requisição recebida:", req.body);

    // 🔑 Chave da sua API SSTV
    const API_KEY = "70d96e0c-8848-4c28-b429-41487fc7421e";

    // 🔗 Faz requisição ao endpoint da SSTV
    const response = await fetch(`https://sstv.center/test.php?key=${API_KEY}`);
    const data = await response.text(); // SSTV geralmente responde em texto (não JSON)

    // 🔍 Se quiser validar o retorno antes, pode inspecionar 'data'
    console.log("🔗 Resposta da SSTV:", data);

    // 🔹 Retorna o link pro ManyChat
    res.status(200).json({
      version: "v2",
      content: {
        messages: [
          {
            type: "text",
            text: `🎉 Seu link de teste foi gerado com sucesso!\n${data}`,
          },
        ],
      },
    });
  } catch (error) {
    console.error("⚠️ Erro ao gerar link:", error);
    res.status(500).json({
      version: "v2",
      content: {
        messages: [
          {
            type: "text",
            text: "❌ Erro ao gerar o link, tente novamente em instantes.",
          },
        ],
      },
    });
  }
});

// 🚀 Inicia servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
