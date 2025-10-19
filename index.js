import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Proxy ativo e pronto para POST!");
});

app.post("/", async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ error: "Chave não fornecida!" });
    }

    const response = await fetch(`https://sstv.center/test.php?key=${key}`);
    const html = await response.text();

    // Extrai dados principais com expressões regulares
    const usuario = html.match(/Usuário:\s*<\/b>\s*([A-Za-z0-9]+)/i)?.[1] || "Não encontrado";
    const senha = html.match(/Senha:\s*<\/b>\s*([A-Za-z0-9]+)/i)?.[1] || "Não encontrada";
    const dns1 = html.match(/Url DNS1:\s*<\/b>\s*(http[^\s<]+)/i)?.[1] || "Não encontrado";
    const dns2 = html.match(/Url DNS2:\s*<\/b>\s*(http[^\s<]+)/i)?.[1] || "Não encontrado";
    const loja1 = html.match(/Loja1:\s*(https[^\s<]+)/i)?.[1] || "Não encontrada";
    const loja2 = html.match(/Loja2:\s*(https[^\s<]+)/i)?.[1] || "Não encontrada";
    const apk = html.match(/Apk STV\.1:\s*\(([^)]+)\)/i)?.[1] || "Não encontrado";

    // Monta texto formatado
    const texto = `
🎉 *Teste criado com sucesso!*

📺 *Usuário:* ${usuario}
🔑 *Senha:* ${senha}
🌐 *DNS 1:* ${dns1}
🌐 *DNS 2:* ${dns2}
🏪 *Loja 1:* ${loja1}
🏪 *Loja 2:* ${loja2}
📲 *APK:* ${apk}
`.trim();

    res.status(200).json({
      version: "v2",
      content: {
        messages: [
          {
            type: "text",
            text: texto
          }
        ]
      }
    });

  } catch (error) {
    console.error("Erro ao gerar teste:", error);
    res.status(500).json({
      version: "v2",
      content: {
        messages: [
          {
            type: "text",
            text: "❌ Erro ao gerar o teste, tente novamente mais tarde."
          }
        ]
      }
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
