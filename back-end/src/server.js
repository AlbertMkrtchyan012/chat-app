require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const setupSocket = require("./socket/socket");
const prisma = require("./config/prisma");
const cors = require("cors")

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
  console.error("Խնդրում ենք .env ֆայլում լրացնել JWT_SECRET և DATABASE_URL արժեքները։");
  process.exit(1);
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PATCH"]
  }
});

app.set("io", io);
setupSocket(io);

const port = Number(process.env.PORT) || 5000;

server.listen(port, () => {
  console.log(`Սերվերը աշխատում է՝ http://localhost:${port}`);
});

async function shutdown() {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
