require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");

const { ensureFile } = require("./utils/store");

// Make sure all data files exist before anything tries to read them
ensureFile("products.json", []);
ensureFile("orders.json", []);
ensureFile("messages.json", []);
ensureFile("users.json", []);

const productsRouter = require("./routes/products");
const ordersRouter = require("./routes/orders");
const contactRouter = require("./routes/contact");
const adminRouter = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/contact", contactRouter);
app.use("/api/admin", adminRouter);

// Serve the frontend (single Node app powers both site + API)
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

// Convenience alias: /admin -> admin.html
app.get("/admin", (req, res) => {
  res.sendFile(path.join(frontendPath, "admin.html"));
});

// Fallback: any unknown non-API route serves index.html (nice for direct links)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Velira server ${PORT}-portda ishga tushdi: http://localhost:${PORT}`);

  // Start the Telegram bot alongside the web server (polling mode).
  try {
    const { initBot } = require("./bot/bot");
    initBot();
  } catch (err) {
    console.error("[bot] Ishga tushmadi:", err.message);
  }
});
