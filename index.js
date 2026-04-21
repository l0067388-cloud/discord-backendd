const express = require("express");
const cors = require("cors");

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

    const finalContent =
      content && content.trim() !== ""
        ? content
        : "Cuenta disponible 🔥";

    let message = finalContent;

    // 🔥 agregar imágenes como links
    if (images && images.length > 0) {
      message += "\n\n" + images.join("\n");
    }

    const response = await fetchFn(webhook_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
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
