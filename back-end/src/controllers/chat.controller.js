
const chatService = require("../services/chat.service");

async function chats(req, res, next) {
  try {
    const result = await chatService.listChats(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function history(req, res, next) {
  try {
    const messages = await chatService.getHistory(
      req.user.id,
      req.params.userId,
      req.query.take
    );

    res.json(messages);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  chats,
  history
};
