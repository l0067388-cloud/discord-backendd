const express = require("express");
const multer = require("multer");
const FormData = require("form-data");
const cors = require("cors");

// fetch compatible
let fetchFn = global.fetch;
if (!fetchFn) {
  fetchFn = (...args) =>
    import("node-fetch").then(({ default: f }) => f(...args));
}

const app = express();

// middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const upload = multer();

// DEBUG (puedes quitar después)
app.use((req, res, next) => {
  console.log("BODY:", req.body);
  next();
});

app.post("/api/send-discord", upload.array("files", 10), async (req, res) => {
  try {
    const webhook = req.body.webhook_url;
    if (!webhook) {
      return res.status(400).json({ error: "webhook_url requerido" });
    }

    // contenido seguro
    const content =
      req.body.content && req.body.content.trim() !== ""
        ? req.body.content
        : "Cuenta disponible 🔥";

    const form = new FormData();

    if (req.files && req.files.length > 0) {
      // ✅ CON IMÁGENES
      form.append(
        "payload_json",
        JSON.stringify({
          content: content,
        })
      );

      req.files.forEach((file, i) => {
        form.append(`files[${i}]`, file.buffer, file.originalname);
      });
    } else {
      // ✅ SIN IMÁGENES
      form.append("content", content);
    }

    const response = await fetchFn(webhook, {
      method: "POST",
      body: form,
      headers: form.getHeaders(),
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

// ruta base
app.get("/", (req, res) => {
  res.send("Servidor activo 🚀");
});

app.listen(3000, () => console.log("RUNNING 🚀"));
