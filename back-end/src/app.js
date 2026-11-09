require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const friendsRoutes = require("./routes/friends.routes");
const chatRoutes = require("./routes/chat.routes");
const { notFound, errorHandler } = require("./middleware/error.middleware");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
}));
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/chats", chatRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
