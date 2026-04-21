const express = require("express");
const cors = require("cors");
const FormData = require("form-data");

let fetchFn = global.fetch;
if (!fetchFn) {
  fetchFn = (...args) =>
    import("node-fetch").then(({ default: f }) => f(...args));
}

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/send-discord", async (req, res) => {
  try {
    const { webhook_url, content, images } = req.body;

    if (!webhook_url) {
      return res.status(400).json({ error: "webhook_url requerido" });
    }

    const form = new FormData();

    // contenido
    form.append("content", content || "Cuenta disponible 🔥");

    // 🔥 descargar y adjuntar imágenes
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const imgUrl = images[i];

        const response = await fetchFn(imgUrl);
        const buffer = Buffer.from(await response.arrayBuffer());

        form.append(`files[${i}]`, buffer, `image${i}.png`);
      }
    }

    const discordRes = await fetchFn(webhook_url, {
      method: "POST",
      body: form,
      headers: form.getHeaders(),
    });

    if (!discordRes.ok) {
      const text = await discordRes.text();
      return res.status(500).json({ error: text });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Servidor activo 🚀");
});

app.listen(3000, () => console.log("RUNNING 🚀"));
