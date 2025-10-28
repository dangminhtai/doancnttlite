import mongoose from "mongoose";

const messagePartSchema = new mongoose.Schema({
    text: {
        type: String,
        required: false,
    },
    fileData: {
        mimeType: { type: String },
        fileUri: { type: String },
    },
});

const chatHistorySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true, // ID Discord user
    },
    channelId: {
        type: String,
        required: true, // để phân biệt theo channel
    },
    role: {
        type: String,
        enum: ["user", "assistant"],
        required: true,
    },
    messageParts: [messagePartSchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("ChatHistory", chatHistorySchema);
