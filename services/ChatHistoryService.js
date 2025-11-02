import ChatHistory from "../models/ChatHistory.js";

export class ChatHistoryService {
    async getUserHistory(userId, channelId) {
        const userData = await ChatHistory.findOne({ userId, channelId }).lean();
        if (!userData) return [];

        const turns = userData.turns.slice(-20); // 💫 chỉ lấy 20 lượt gần nhất
        const flat = [];

        for (const turn of turns) {
            if (turn.user?.parts?.length) flat.push({ role: "user", parts: turn.user.parts });
            if (turn.model?.parts?.length) flat.push({ role: "model", parts: turn.model.parts });
        }

        return flat;
    }

    async saveTurn(userId, channelId, userParts, modelParts) {
        const turn = { user: { parts: userParts }, model: { parts: modelParts } };
        await ChatHistory.updateOne(
            { userId, channelId },
            { $push: { turns: turn } },
            { upsert: true }
        );
    }
}
