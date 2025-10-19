import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const API_KEY = process.env.API_KEY; // sua chave da SSTV vai lá no Render (Environment Variables)

// Rota principal — só pra verificar se o proxy tá ativo
app.get("/", (req, res) => {
  res.send("✅ Proxy ativo e pronto para POST!");
});

// Rota que o ManyChat vai chamar
app.post("/", async (req, res) => {
  try {
    // Faz requisição ao endpoint da SSTV
    const response = await fetch(`https://sstv.center/test.php?key=${API_KEY}`);
    const data = await response.text(); // SSTV geralmente responde com texto (não JSON)

    // (Opcional) Log pra debug no Render — ajuda a ver o retorno exato
    console.log("🔍 Resposta da SSTV:", data);

    // Retorna o link real pro ManyChat
    res.status(200).json({
      link: data.trim() // remove espaços ou quebras de linha
    });

  } catch (error) {
    console.error("⚠️ Erro ao gerar link:", error);

    // Retorno pro ManyChat caso algo dê errado
    res.status(500).json({
      version: "v2",
      content: {
        messages: [
          {
            type: "text",
            text: "❌ Erro ao gerar o link, tente novamente em instantes."
          }
        ]
      }
    });
  }
});

// Porta padrão (Render define automaticamente)
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
