import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/", async (req, res) => {
  const { key } = req.body;

  try {
    // Faz requisição ao endpoint da SSTV
    const response = await fetch(`https://sstv.center/test.php?key=${key}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
        "Accept": "*/*",
      },
    });

    const data = await response.text();

    // Se o retorno for HTML, a SSTV bloqueou
    if (data.startsWith("<!DOCTYPE html>")) {
      return res.status(500).json({
        error: "A SSTV bloqueou o acesso automático. Tente novamente em instantes.",
        resposta: data.slice(0, 200) + "..."
      });
    }

    // Retorna o link para o ManyChat
    res.status(200).json({
      link: data.trim(),
    });
  } catch (error) {
    console.error("Erro ao gerar link:", error);
    res.status(500).json({
      error: "Não foi possível gerar o link de teste automaticamente.",
      detalhes: error.message,
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
