import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Rota GET — só pra confirmar se o proxy tá ativo
app.get("/", (req, res) => {
  res.send("✅ Proxy ativo e pronto para POST!");
});

// 🔹 Rota POST — ManyChat vai chamar aqui
app.post("/", async (req, res) => {
  console.log("📩 Requisição recebida do ManyChat:", req.body);

  try {
    // Exemplo: você pode pegar algum dado do ManyChat, se quiser
    // const { name, phone } = req.body;

    // Aqui é o link do teste IPTV (coloca o real depois)
    const linkGerado = "https://sstv.center/gerar-teste-exemplo";

    // Retorna o JSON no formato correto pro ManyChat
    res.status(200).json({
      version: "v2",
      content: {
        messages: [
          {
            type: "text",
            text: `🎉 Seu link de teste foi gerado com sucesso! Acesse abaixo: \n${linkGerado}`,
          },
        ],
      },
    });
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    res.status(500).json({
      version: "v2",
      content: {
        messages: [
          {
            type: "text",
            text: "⚠️ Ocorreu um erro ao gerar o link. Tente novamente em instantes.",
          },
        ],
      },
    });
  }
});

// 🔹 Inicia o servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
