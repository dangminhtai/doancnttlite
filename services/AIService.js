import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "../config/env.js";
import { systemPrompt } from "../config/systemPrompt/vn.js";
import { File } from "buffer";

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
        // Tạo một File object có thuộc tính size mà lib upload có thể dùng
        const fileObj = new File([buffer], fileName, { type: mimeType });

        // Gọi upload như trước nhưng truyền object File thay vì Buffer thô
        const uploaded = await this.ai.files.upload({
            file: fileObj,
            config: {
                displayName: fileName,
                mimeType,
                // name: fileName, // tuỳ lib, nhưng đã có displayName
            },
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
