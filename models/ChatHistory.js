import mongoose from "mongoose";

const messagePartSchema = new mongoose.Schema({
    text: String,
    fileData: {
        mimeType: String,
        fileUri: String,
    },
});

// Mỗi "chat turn" = user hỏi + model trả lời
const chatTurnSchema = new mongoose.Schema({
    user: {
        parts: [messagePartSchema],
    },
    model: {
        parts: [messagePartSchema],
    },
    createdAt: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    channelId: { type: String, required: true },
    turns: [chatTurnSchema],
});

chatSchema.index({ userId: 1, channelId: 1 });

export default mongoose.model("ChatHistory", chatSchema);
