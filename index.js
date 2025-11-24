const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Guardamos el último ticket enviado
let lastTicketText = null;

// Home
app.get("/", (req, res) => {
  res.send("Aldo's CloudPRNT server is running.");
});

// Printer polling endpoint
app.get("/cloudprnt", (req, res) => {
  if (!lastTicketText) {
    console.log("Printer poll - no job.");
    return res.json({
      jobReady: false
    });
  }

  console.log("Printer poll - sending job to printer.");

  const dataBase64 = Buffer.from(lastTicketText, "utf8").toString("base64");

  const job = {
    jobReady: true,
    job: {
      contentType: "text/plain",
      data: dataBase64
    }
  };

  lastTicketText = null; // Consumido
  res.json(job);
});

// Endpoint donde tu página manda el ticket
app.post("/submit", (req, res) => {
  const { ticket } = req.body;

  if (!ticket) {
    return res.status(400).json({ error: "Missing ticket" });
  }

  lastTicketText = ticket;

  console.log("Ticket received:", ticket);
  res.json({ ok: true });
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Aldo CloudPRNT server running on port ${PORT}`);
});
