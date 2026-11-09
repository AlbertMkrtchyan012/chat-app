const jwt = require("jsonwebtoken");
const chatService = require("../services/chat.service");
const { validateMessage } = require("../utils/validateMessage");

function setupSocket(io) {
  const onlineCounts = new Map();

  // Проверка JWT при подключении
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(
        new Error("Մուտք գործելու համար անհրաժեշտ է նույնականացում։")
      );
    }

    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);

      if (!socket.user.id) {
        return next(new Error("Օգտատիրոջ տվյալները սխալ են։"));
      }

      next();
    } catch {
      next(
        new Error("Մուտքի ժամկետն ավարտվել է։ Կրկին մուտք գործեք։")
      );
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;

    // Բոլոր ակտիվ կապերը միանում են օգտատիրոջ սենյակին
    socket.join(`user:${userId}`);

    onlineCounts.set(
      userId,
      (onlineCounts.get(userId) || 0) + 1
    );

    io.emit("online_users", Array.from(onlineCounts.keys()));

    // Անձնական հաղորդագրություն
    socket.on("private_message", async (payload, ack) => {
      const reply = typeof ack === "function" ? ack : () => {};

      try {
        const receiverId = payload?.receiverId;
        const content = payload?.content;

        if (
          typeof receiverId !== "string" ||
          receiverId.length === 0
        ) {
          return reply({
            ok: false,
            message: "Ստացողի տվյալները սխալ են։"
          });
        }

        if (
          typeof content !== "string" ||
          !validateMessage(content)
        ) {
          return reply({
            ok: false,
            message:
              "Հաղորդագրությունը կարող է պարունակել միայն հայերեն կամ լատինատառ տառեր, թվեր և բացատներ (առավելագույնը՝ 2000 նիշ)։"
          });
        }

        // Сервис проверит дружбу и сохранит JSON в PostgreSQL
        const message = await chatService.saveMessage(
          userId,
          receiverId,
          content
        );

        // Доставляем сообщение отправителю и получателю
        io.to(`user:${userId}`)
          .to(`user:${receiverId}`)
          .emit("private_message", message);

        reply({
          ok: true,
          message: "Հաղորդագրությունն ուղարկվել է։",
          data: message
        });
      } catch (err) {
        reply({
          ok: false,
          message:
            err.status && err.status < 500
              ? err.message
              : "Հաղորդագրությունն ուղարկել չհաջողվեց։"
        });
      }
    });

    socket.on("disconnect", () => {
      const count = (onlineCounts.get(userId) || 1) - 1;

      if (count <= 0) {
        onlineCounts.delete(userId);
      } else {
        onlineCounts.set(userId, count);
      }

      io.emit("online_users", Array.from(onlineCounts.keys()));
    });
  });
}

module.exports = setupSocket;
