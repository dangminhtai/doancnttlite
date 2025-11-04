import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "../config/env.js";
import { systemPrompt, systemPromptForFunction } from "../config/systemPrompt/vn.js";
import { Blob } from "node:buffer";
import { tools } from "../config/tools.js";
import { sendResFunction } from "../config/resSchema.js";
export class AIService {
    constructor() {
        this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    }

    async uploadFromUrl(url, fileName, mimeType) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Cannot fetch file: ${res.status}`);

        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        if (!buffer.length) throw new Error(`Empty file: ${fileName}`);
        // const cleanMime = (mimeType || "application/octet-stream").split(";")[0].trim();
        // console.log('Mime type sau khi chuẩn hóa', cleanMime);
        const blob = new Blob([buffer], { type: mimeType });

        const uploaded = await this.ai.files.upload({
            file: blob,
            config: {
                displayName: fileName,
                mimeType: mimeType,
            },
        });

        return uploaded.uri;
    }




    createChat(history) {
        return this.ai.chats.create({
            model: "gemini-2.5-flash-lite-preview-09-2025",
            history: history,
            config: {
                systemInstruction: systemPrompt,
                tools: tools,
                temperature: 0.4,
            },
        });
    }
    async genContent(contents) {
        return this.ai.models.generateContent({
            model: "gemini-2.5-flash-lite-preview-09-2025",
            contents: contents,
            config: {
                tools: [{
                    functionDeclarations: [sendResFunction]
                }]
            },
        })
    }
    async sendMessage(chat, messageParts) {
        const res = await chat.sendMessage({ message: messageParts });
        return res.text || 'Không có phản hồi từ Memi, đang gặp lỗi hệ thống';
        // const resObj = JSON.parse(res.text);
        // return resObj.message;
    }
}
