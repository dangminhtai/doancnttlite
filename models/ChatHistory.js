import mongoose from "mongoose";

const messagePartSchema = new mongoose.Schema({
    text: String,
    fileData: {
        mimeType: String,
        fileUri: String,
    },
}, { _id: false });

const chatTurnSchema = new mongoose.Schema({
    user: {
        parts: [messagePartSchema],
    },
    model: {
        parts: [messagePartSchema],
    },
    createdAt: { type: Date, default: Date.now },
}, { _id: false });


const chatSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    channelId: { type: String, required: true },
    turns: [chatTurnSchema],
});

chatSchema.index({ userId: 1, channelId: 1 });

export default mongoose.model("ChatHistory", chatSchema);
