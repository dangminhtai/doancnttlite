import ChatHistory from "../models/ChatHistory.js";

export class ChatHistoryService {
    async getUserHistory(userId, channelId) {
        const userData = await ChatHistory.findOne({ userId, channelId }).lean();
        if (!userData) return [];

        const flat = [];
        for (const turn of userData.turns) {
            if (turn.user?.parts?.length) flat.push({ role: "user", parts: turn.user.parts });
            if (turn.model?.parts?.length) flat.push({ role: "model", parts: turn.model.parts });
        }
        return flat;
    }

    async saveTurn(userId, channelId, userParts, modelParts) {
        const existing = await ChatHistory.findOne({ userId, channelId });
        const turn = { user: { parts: userParts }, model: { parts: modelParts } };

        if (existing) {
            await ChatHistory.updateOne({ userId, channelId }, { $push: { turns: turn } });
        } else {
            await ChatHistory.create({ userId, channelId, turns: [turn] });
        }
    }
}
