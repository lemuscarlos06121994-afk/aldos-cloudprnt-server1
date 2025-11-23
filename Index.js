// index.js
// Simple CloudPRNT server for Aldo's Pizzeria

const express = require("express");
const cors = require("cors");
const app = express();

// Allow JSON body
app.use(express.json());
// Allow requests from your kiosk (Netlify, local, etc.)
app.use(cors());

// Here we store the last order that the kiosk sends
let lastOrder = null;

/**
 * POST /order
 * Your kiosk (app de Aldo's) will send the order here.
 *
 * Example body:
 * {
 *   "ticket": "1x Cheese Pizza\n1x Wings (10)...",
 *   "total": "$32.50",
 *   "payMethod": "cash" or "card",
 *   "orderType": "pickup" or "delivery"
 * }
 */
app.post("/order", (req, res) => {
  console.log("New order received:");
  console.log(JSON.stringify(req.body, null, 2));

  lastOrder = req.body || null;

  return res.json({
    ok: true,
    message: "Order stored for CloudPRNT printer."
  });
});

/**
 * GET /cloudprnt
 * The Star CloudPRNT printer will call this URL.
 * It asks: “Do you have a job for me?”
 */
app.get("/cloudprnt", (req, res) => {
  // No pending order -> tell printer "no job"
  if (!lastOrder) {
    return res.json({
      jobReady: false
    });
  }

  // Build simple kitchen-style ticket text
  const now = new Date();
  const timeStr = now.toISOString().replace("T", " ").slice(0, 19);

  const ticketText =
    "ALDO'S PIZZERIA\n" +
    "------------------------\n" +
    `Time: ${timeStr}\n` +
    `Order type: ${lastOrder.orderType || "pickup"}\n` +
    `Payment: ${lastOrder.payMethod || "unknown"}\n` +
    "------------------------\n\n" +
    (lastOrder.ticket || "") +
    "\n\n" +
    "------------------------\n" +
    `TOTAL: ${lastOrder.total || "$0.00"}\n` +
    "THANK YOU!\n\n\n";

  // Encode to base64 for CloudPRNT
  const base64Content = Buffer.from(ticketText, "utf8").toString("base64");

  const jobToken = Date.now().toString();

  const job = {
    jobReady: true,
    mediaTypes: ["text/plain"],
    jobToken: jobToken,
    content: base64Content
  };

  // Clear last order so the same order is not re-printed
  lastOrder = null;

  return res.json(job);
});

// Simple homepage to test that the server is running
app.get("/", (req, res) => {
  res.send(
    "<h1>Aldo's CloudPRNT Server</h1><p>Endpoints:<br>POST /order<br>GET /cloudprnt</p>"
  );
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CloudPRNT server running on port ${PORT}`);
});
