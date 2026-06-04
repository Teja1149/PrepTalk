const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, ".env")
});

const express = require("express");
const cors = require("cors");

const chatRoutes = require("./routes/chatRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const transcribeRoutes = require("./routes/transcribeRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const ttsRoutes = require("./routes/ttsRoutes");
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api/tts", ttsRoutes);
app.get("/", (req, res) => {
  res.send("PrepTalk AI backend server is running");
});

app.use("/api/chat", chatRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/transcribe", transcribeRoutes);

app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

app.listen(PORT, () => {
  console.log(`PrepTalk AI backend running on port ${PORT}`);
});
