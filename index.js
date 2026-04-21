const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// debug opcional
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

    // 🔥 FormData NATIVO (NO usar librería form-data)
    const form = new FormData();

    // 🔥 clave: content normal (NO payload_json)
    form.append("content", finalContent);

    let index = 0;

    // 🔥 agregar imágenes como files[index]
    if (images && images.length > 0) {
      for (const imgUrl of images) {
        try {
          console.log("DESCARGANDO:", imgUrl);

          const response = await fetch(imgUrl);
          console.log("STATUS:", response.status);

          if (!response.ok) continue;

          const blob = await response.blob();

          // 🔥 MUY IMPORTANTE: files[0], files[1]...
          form.append(`files[${index}]`, blob, `image${index}.png`);

          index++;
        } catch (err) {
          console.log("ERROR DESCARGANDO:", err.message);
        }
      }
    }

    console.log("FILES ENVIADOS:", index);

    const discordRes = await fetch(webhook_url, {
      method: "POST",
      body: form
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

app.get("/", (req, res) => {
  res.send("Servidor activo 🚀");
});

app.listen(3000, () => console.log("RUNNING 🚀"));
