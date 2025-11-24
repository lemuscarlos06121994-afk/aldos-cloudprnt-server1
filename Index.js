// Simple CloudPRNT server for Aldo's

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

// ====== MIDDLEWARE ======
app.use(cors());
app.use(express.json());

// Aquí guardamos el último ticket que mandó el kiosco
let lastTicketText = null;

// ====== RUTA HOME (solo para probar) ======
app.get("/", (req, res) => {
  res.send("✅ Aldo's CloudPRNT server is running.");
});

// =========================================================
// 1) El kiosco (tu página de GitHub) manda la orden aquí
//    POST https://aldos-printcore-server-1.onrender.com/submit
// =========================================================
app.post("/submit", (req, res) => {
  const { ticket, deviceId } = req.body || {};

  if (!ticket) {
    console.log("❌ /submit sin ticket");
    return res.status(400).json({ ok: false, error: "Missing ticket" });
  }

  // Opcional: podríamos comprobar deviceId si quisieras
  console.log("🧾 New ticket received from kiosk.");
  lastTicketText = ticket;

  return res.json({ ok: true });
});

// =========================================================
// 2) La impresora pregunta aquí si hay trabajo
//    GET https://aldos-printcore-server-1.onrender.com/cloudprnt
// =========================================================
app.get("/cloudprnt", (req, res) => {
  // Si NO hay ticket pendiente
  if (!lastTicketText) {
    console.log("🔄 Printer poll - no job.");
    return res.json({
      jobReady: false
    });
  }

  // Si SÍ hay ticket pendiente
  console.log("📨 Printer poll - sending job to printer.");

  // Convertimos el texto a base64 (CloudPRNT espera datos binarios/base64)
  const dataBase64 = Buffer.from(lastTicketText, "utf8").toString("base64");

  const job = {
    jobReady: true,
    job: {
      // Texto plano; la impresora usará su fuente por defecto
      contentType: "text/plain",
      // Datos del ticket en base64
      data: dataBase64
    }
  };

  // Borramos el ticket después de entregarlo
  lastTicketText = null;

  return res.json(job);
});

// ====== ARRANCAR SERVIDOR ======
app.listen(PORT, () => {
  console.log(`🚀 Aldo's CloudPRNT server listening on port ${PORT}`);
});
