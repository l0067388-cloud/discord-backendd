const express = require("express");
const cors = require("cors");
const FormData = require("form-data");

// fetch compatible
let fetchFn = global.fetch;
if (!fetchFn) {
  fetchFn = (...args) =>
    import("node-fetch").then(({ default: f }) => f(...args));
}

const app = express();

app.use(cors());
app.use(express.json());

// DEBUG
app.use((req, res, next) => {
  console.log("BODY:", req.body);
  next();
});

app.post("/api/send-discord", async (req, res) => {
  try {
    const { webhook_url, content, images } = req.body;

    if (!webhook_url) {
      return res.status(400).json({ error: "webhook_url requerido" });
    }

    // 🔥 contenido seguro SIEMPRE
    const finalContent =
      content && content.trim() !== ""
        ? content
        : "Cuenta disponible 🔥";

    const form = new FormData();

    // siempre mandamos contenido
    form.append("content", finalContent);

    let filesAdded = 0;

    // 🔥 descargar imágenes y agregarlas como archivos
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const imgUrl = images[i];

        try {
          console.log("DESCARGANDO:", imgUrl);

          const response = await fetchFn(imgUrl);
          console.log("STATUS:", response.status);

          if (!response.ok) {
            console.log("❌ No se pudo descargar:", imgUrl);
            continue;
          }

          const buffer = Buffer.from(await response.arrayBuffer());

          form.append(`files[${filesAdded}]`, buffer, `image${filesAdded}.png`);
          filesAdded++;

        } catch (err) {
          console.log("❌ Error descargando imagen:", err.message);
        }
      }
    }

    console.log("FILES ENVIADOS:", filesAdded);

    // 🔥 enviar a Discord
    const discordRes = await fetchFn(webhook_url, {
      method: "POST",
      body: form,
      headers: form.getHeaders(),
    });

    const text = await discordRes.text();

    if (!discordRes.ok) {
      console.log("ERROR DISCORD:", text);
      return res.status(500).json({ error: text });
    }

    res.json({ ok: true });

  } catch (err) {
    console.error("ERROR GENERAL:", err);
    res.status(500).json({ error: err.message });
  }
});

// ruta base
app.get("/", (req, res) => {
  res.send("Servidor activo 🚀");
});

app.listen(3000, () => console.log("RUNNING 🚀"));
