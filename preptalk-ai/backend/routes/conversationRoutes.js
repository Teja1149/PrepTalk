const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createConversation,
  getConversations,
  getConversationMessages,
  deleteConversation
} = require("../controllers/conversationController");

router.post("/", authMiddleware, createConversation);
router.get("/", authMiddleware, getConversations);
router.get("/:conversationId/messages", authMiddleware, getConversationMessages);
router.delete("/:conversationId", authMiddleware, deleteConversation);

module.exports = router;
