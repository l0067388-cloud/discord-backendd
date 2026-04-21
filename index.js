const express = require("express");
const multer = require("multer");
const FormData = require("form-data");
const cors = require("cors");

// Node 22 ya trae fetch global, pero dejamos fallback por si acaso
let fetchFn = global.fetch;
if (!fetchFn) {
  fetchFn = (...args) =>
    import("node-fetch").then(({ default: f }) => f(...args));
}

const app = express();
app.use(cors());

const upload = multer();

app.post("/api/send-discord", upload.array("files", 10), async (req, res) => {
  try {
    const webhook = req.body.webhook_url;
    if (!webhook) {
      return res.status(400).json({ error: "webhook_url requerido" });
    }

    const form = new FormData();

    form.append(
      "payload_json",
      JSON.stringify({
        content: req.body.content || "",
      })
    );

    if (req.files && req.files.length > 0) {
      req.files.forEach((file, i) => {
        form.append(`files[${i}]`, file.buffer, file.originalname);
      });
    }

    const response = await await fetch(webhook, {
  method: "POST",
  body: form,
  headers: form.getHeaders()
});

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: text });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// Ruta para probar en navegador
app.get("/", (req, res) => {
  res.send("Servidor activo 🚀");
});

app.listen(3000, () => console.log("RUNNING 🚀"));
