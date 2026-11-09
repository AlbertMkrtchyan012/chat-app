
const prisma = require("../config/prisma");
const HttpError = require("../utils/httpError");

async function listUsers(currentUserId) {
  return prisma.user.findMany({
    where: { id: { not: currentUserId } },
    select: {
      id: true,
      name: true,
      surname: true,
      username: true,
      createdAt: true
    },
    orderBy: { username: "asc" }
  });
}

async function sendRequest(senderId, receiverId) {
  if (!receiverId || receiverId === senderId) {
    throw new HttpError(
      400,
      "Չեք կարող հայտ ուղարկել ինքներդ ձեզ։"
    );
  }

  const receiver = await prisma.user.findUnique({
    where: { id: receiverId }
  });

  if (!receiver) {
    throw new HttpError(404, "Օգտատերը չի գտնվել։");
  }

  const [friendship, outgoing, incoming] = await Promise.all([
    prisma.friendship.findFirst({
      where: {
        OR: [
          { userAId: senderId, userBId: receiverId },
          { userAId: receiverId, userBId: senderId }
        ]
      }
    }),

    prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: { senderId, receiverId }
      }
    }),

    prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId: receiverId,
          receiverId: senderId
        }
      }
    })
  ]);

  if (friendship) {
    throw new HttpError(409, "Դուք արդեն ընկերներ եք։");
  }

  if (incoming?.status === "PENDING") {
    throw new HttpError(
      409,
      "Այս օգտատերն արդեն ձեզ ընկերության հայտ է ուղարկել։"
    );
  }

  if (outgoing?.status === "PENDING") {
    throw new HttpError(
      409,
      "Ընկերության հայտը դեռ սպասում է պատասխանին։"
    );
  }

  if (outgoing) {
    return prisma.friendRequest.update({
      where: { id: outgoing.id },
      data: { status: "PENDING" },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            surname: true,
            username: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            surname: true,
            username: true
          }
        }
      }
    });
  }

  return prisma.friendRequest.create({
    data: { senderId, receiverId },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          surname: true,
          username: true
        }
      },
      receiver: {
        select: {
          id: true,
          name: true,
          surname: true,
          username: true
        }
      }
    }
  });
}

async function listRequests(userId) {
  return prisma.friendRequest.findMany({
    where: {
      receiverId: userId,
      status: "PENDING"
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          surname: true,
          username: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

async function respondToRequest(userId, requestId, decision) {
  if (!["ACCEPTED", "REJECTED"].includes(decision)) {
    throw new HttpError(
      400,
      "Ընտրեք ընդունել կամ մերժել։"
    );
  }

  const request = await prisma.friendRequest.findUnique({
    where: { id: requestId }
  });

  if (!request || request.receiverId !== userId) {
    throw new HttpError(404, "Հայտը չի գտնվել։");
  }

  if (request.status !== "PENDING") {
    throw new HttpError(
      409,
      "Այս հայտին արդեն պատասխանել եք։"
    );
  }

  if (decision === "REJECTED") {
    return prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" }
    });
  }

  const [userAId, userBId] = [
    request.senderId,
    request.receiverId
  ].sort();

  return prisma.$transaction(async (tx) => {
    const updated = await tx.friendRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" }
    });

    await tx.friendship.upsert({
      where: {
        userAId_userBId: { userAId, userBId }
      },
      create: { userAId, userBId },
      update: {}
    });

    const chat = await tx.chat.upsert({
      where: {
        userAId_userBId: { userAId, userBId }
      },
      create: { userAId, userBId },
      update: {},
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
        }
      }
    });

    return {
      ...updated,
      chat
    };
  });
}

async function listFriends(userId) {
  const rows = await prisma.friendship.findMany({
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
      }
    }
  });

  return rows.map((row) =>
    row.userAId === userId ? row.userB : row.userA
  );
}

module.exports = {
  listUsers,
  sendRequest,
  listRequests,
  respondToRequest,
  listFriends
};
