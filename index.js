import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Rota GET — só pra verificar se o proxy tá ativo
app.get("/", (req, res) => {
  res.send("✅ Proxy ativo e pronto para POST!");
});

// 🔹 Rota POST — o ManyChat vai chamar aqui
app.post("/", async (req, res) => {
  console.log("📩 Requisição recebida do ManyChat:", req.body);

  // aqui você pode pegar dados do ManyChat se quiser (ex: nome, telefone, etc)
  // const { name, phone } = req.body;

  // 🔹 envia o link de teste pro ManyChat
  res.json({
    link: "https://sstv.center/teste-gerado-exemplo"
  });
});

// 🔹 inicia o servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));

