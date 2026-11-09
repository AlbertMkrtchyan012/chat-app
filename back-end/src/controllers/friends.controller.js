
const friendsService = require("../services/friends.service");

async function users(req, res, next) {
  try {
    res.json(await friendsService.listUsers(req.user.id));
  } catch (err) {
    next(err);
  }
}

async function sendRequest(req, res, next) {
  try {
    const request = await friendsService.sendRequest(
      req.user.id,
      req.body.receiverId
    );

    const io = req.app.get("io");

    io.to(`user:${request.receiverId}`).emit("friend_request", {
      message: "Դուք ստացել եք ընկերության նոր հայտ։",
      request
    });

    res.status(201).json({
      message: "Ընկերության հայտը ուղարկվել է։",
      request
    });
  } catch (err) {
    next(err);
  }
}

async function requests(req, res, next) {
  try {
    res.json(await friendsService.listRequests(req.user.id));
  } catch (err) {
    next(err);
  }
}

async function respond(req, res, next) {
  try {
    const request = await friendsService.respondToRequest(
      req.user.id,
      req.params.id,
      req.body.decision
    );

    const io = req.app.get("io");

    io.to(`user:${request.senderId}`).emit("friend_request_updated", {
      message:
        request.status === "ACCEPTED"
          ? "Ձեր ընկերության հայտը ընդունվել է։"
          : "Ձեր ընկերության հայտը մերժվել է։",
      requestId: request.id,
      status: request.status
    });

    let chat = null;

    if (request.status === "ACCEPTED") {
      chat = request.chat;

      const participants = [chat.userA, chat.userB];

      for (const participant of participants) {
        const friend = participants.find(
          (user) => user.id !== participant.id
        );

        io.to(`user:${participant.id}`).emit("chat_created", {
          chat: {
            id: chat.id,
            createdAt: chat.createdAt
          },
          friend
        });
      }
    }

    res.json({
      message:
        request.status === "ACCEPTED"
          ? "Հայտն ընդունվել է։ Այժմ կարող եք զրուցել։"
          : "Հայտը մերժվել է։",
      request,
      chat: chat
        ? {
            id: chat.id,
            createdAt: chat.createdAt
          }
        : null
    });
  } catch (err) {
    next(err);
  }
}

async function friends(req, res, next) {
  try {
    res.json(await friendsService.listFriends(req.user.id));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  users,
  sendRequest,
  requests,
  respond,
  friends
};
