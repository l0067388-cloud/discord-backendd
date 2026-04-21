const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

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

    const form = new FormData();

    let index = 0;

    // 🔥 descargar imágenes y agregarlas
    if (images && images.length > 0) {
      for (const imgUrl of images) {
        try {
          console.log("DESCARGANDO:", imgUrl);

          const response = await fetch(imgUrl);
          console.log("STATUS:", response.status);

          if (!response.ok) continue;

          const blob = await response.blob();

          // 🔥 IMPORTANTE: files[index]
          form.append(`files[${index}]`, blob, `image${index}.png`);

          index++;
        } catch (err) {
          console.log("ERROR:", err.message);
        }
      }
    }

    console.log("FILES:", index);

    // 🔥 CREAR EMBEDS PARA MOSTRAR TODAS LAS IMÁGENES
    const embeds = [];

    for (let i = 0; i < index; i++) {
      embeds.push({
        image: {
          url: `attachment://image${i}.png`
        }
      });
    }

    // 🔥 payload final
    form.append(
      "payload_json",
      JSON.stringify({
        content: finalContent,
        embeds: embeds
      })
    );

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
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("RUNNING 🚀"));
