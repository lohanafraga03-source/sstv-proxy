import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/", async (req, res) => {
  try {
    const response = await fetch(
      "https://sstv.center/test.php?key=70d96e0c-8048-4c28-b429-41487fc7421e",
      { method: "GET" }
    );

    const text = await response.text();
    res.status(response.status).send(text);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/", (req, res) => {
  res.send("✅ Proxy SSTV rodando e funcionando!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
