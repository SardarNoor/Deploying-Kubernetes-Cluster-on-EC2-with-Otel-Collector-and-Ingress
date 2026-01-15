const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

// Serve UI
app.use("/", express.static(path.join(__dirname, "public")));

// API endpoints used by UI
app.get("/api/health", (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.get("/api/random", (req, res) => {
  const n = Math.floor(Math.random() * 1000);
  res.json({ number: n });
});

app.get("/api/slow", async (req, res) => {
  const ms = 600 + Math.floor(Math.random() * 900);
  await new Promise(r => setTimeout(r, ms));
  res.json({ ok: true, took_ms: ms });
});

app.listen(3000, "0.0.0.0", () => console.log("UI app listening on :3000"));
