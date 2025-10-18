import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor ativo! ✅");
});

app.post("/", async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) {
      return res.status(400).json({ error: "Chave (key) não enviada." });
    }

    // Faz a requisição para o SSTV usando a chave recebida
    const response = await fetch(`https://sstv.center/test.php?key=${key}`);
    const data = await response.text();

    res.status(200).send(data);
  } catch (error) {
    console.error("Erro no proxy:", error);
    res.status(500).json({ error: "Erro ao processar requisição." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Proxy ativo na porta ${PORT}`));
