
const prisma = require("../config/prisma");
const HttpError = require("../utils/httpError");
const { validateMessage } = require("../utils/validateMessage");

async function findChat(userId, otherUserId) {
  if (!otherUserId || userId === otherUserId) {
    throw new HttpError(400, "Չաթի օգտատերը սխալ է։");
  }

  const [userAId, userBId] = [userId, otherUserId].sort();

  const chat = await prisma.chat.findUnique({
    where: {
      userAId_userBId: { userAId, userBId }
    }
  });

  if (!chat) {
    throw new HttpError(
      403,
      "Նամակ ուղարկելու համար նախ պետք է ընկերներ լինեք։"
    );
  }

  return chat;
}

async function saveMessage(senderId, receiverId, text) {
  if (typeof text !== "string" || !validateMessage(text)) {
    throw new HttpError(
      400,
      "Հաղորդագրությունը կարող է պարունակել միայն հայերեն կամ լատինատառ տառեր, թվեր և բացատներ (առավելագույնը՝ 2000 նիշ)։"
    );
  }

  const chat = await findChat(senderId, receiverId);

  // content is a Prisma Json field, so store a JSON object.
  return prisma.chatMessage.create({
    data: {
      chatId: chat.id,
      senderId,
      content: {
        type: "text",
        text
      }
    },
    select: {
      id: true,
      chatId: true,
      senderId: true,
      content: true,
      createdAt: true
    }
  });
}

async function getHistory(userId, otherUserId, take = 100) {
  const chat = await findChat(userId, otherUserId);

  const limit = Math.min(
    Math.max(Number.parseInt(take, 10) || 100, 1),
    200
  );

  return prisma.chatMessage.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: {
      id: true,
      chatId: true,
      senderId: true,
      content: true,
      createdAt: true
    }
  });
}

async function listChats(userId) {
  const chats = await prisma.chat.findMany({
    where: {
      OR: [
        { userAId: userId },
        { userBId: userId }
      ]
    },
    include: {
      userA: {
        select: {
          id: true,
          name: true,
          surname: true,
          username: true
        }
      },
      userB: {
        select: {
          id: true,
          name: true,
          surname: true,
          username: true
        }
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          senderId: true,
          content: true,
          createdAt: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return chats.map((chat) => ({
    id: chat.id,
    createdAt: chat.createdAt,
    friend: chat.userAId === userId ? chat.userB : chat.userA,
    lastMessage: chat.messages[0] || null
  }));
}

module.exports = {
  saveMessage,
  getHistory,
  listChats
};
