import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "../config/env.js";
import { systemPrompt } from "../config/systemPrompt/vn.js";

export class AIService {
    constructor() {
        this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    }

    async uploadFile(localPath, fileName, mimeType) {
        const uploaded = await this.ai.files.upload({
            file: localPath,
            config: { displayName: fileName, mimeType },
        });
        return uploaded.uri;
    }

    createChat(history) {
        return this.ai.chats.create({
            model: "gemini-2.5-flash-lite-preview-09-2025",
            history,
            config: { systemInstruction: systemPrompt },
        });
    }

    async sendMessage(chat, messageParts) {
        const res = await chat.sendMessage({ message: messageParts });
        return res?.text || "Không có phản hồi từ AI";
    }
}
