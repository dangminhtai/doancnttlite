import mongoose from "mongoose";

const messagePartSchema = new mongoose.Schema({
    text: String,
    fileData: {
        mimeType: String,
        fileUri: String,
    },
});

const chatTurnSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    channelId: { type: String, required: true },
    turn: {
        user: [messagePartSchema],  // Tin nhắn người dùng
        model: [messagePartSchema], // Phản hồi của model
    },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("ChatHistory", chatTurnSchema);
