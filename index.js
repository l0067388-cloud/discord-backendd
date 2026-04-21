const express = require("express");
const cors = require("cors");

// fetch compatible
let fetchFn = global.fetch;
if (!fetchFn) {
  fetchFn = (...args) =>
    import("node-fetch").then(({ default: f }) => f(...args));
}

const app = express();

app.use(cors());
app.use(express.json());

// DEBUG (puedes quitar después)
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

    const finalContent =
      content && content.trim() !== ""
        ? content
        : "Cuenta disponible 🔥";

    // 🔥 función para dividir en grupos de 10 (límite Discord)
    const chunkArray = (arr, size) => {
      const result = [];
      for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
      }
      return result;
    };

    const imageChunks = images && images.length > 0
      ? chunkArray(images, 10)
      : [[]];

    // 🔥 enviar mensajes
    for (let i = 0; i < imageChunks.length; i++) {
      const chunk = imageChunks[i];

      const response = await fetchFn(webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: i === 0 ? finalContent : "", // solo el primer mensaje lleva texto
          embeds: chunk.map((img) => ({
            image: { url: img },
          })),
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        return res.status(500).json({ error: text });
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ruta base
app.get("/", (req, res) => {
  res.send("Servidor activo 🚀");
});

app.listen(3000, () => console.log("RUNNING 🚀"));
