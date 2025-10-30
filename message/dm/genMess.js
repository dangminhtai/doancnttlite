import dotenv from "dotenv";
import path from "path";
import { downloadFile } from "../../logic/downloadFile.js";
import { GoogleGenAI } from "@google/genai";
import { systemPrompt } from "../../config/systemPrompt/vn.js";
import ChatHistory from "../../models/ChatHistory.js";

dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * 🧠 Lấy và định dạng lịch sử chat cho Gemini
 */
async function getFormattedHistory(userId, channelId) {
    try {
        const historyFromDb = await ChatHistory.find({ userId, channelId }).sort({ createdAt: "asc" });

        if (!historyFromDb.length) return [];

        // Chuyển mỗi lượt chat thành 2 message (user và model)
        return historyFromDb.flatMap((record) => {
            const formatted = [];
            if (record.turn.user?.length)
                formatted.push({ role: "user", parts: record.turn.user });
            if (record.turn.model?.length)
                formatted.push({ role: "model", parts: record.turn.model });
            return formatted;
        });
    } catch (error) {
        console.error("Lỗi khi lấy lịch sử chat:", error);
        return [];
    }
}

/**
 * ✨ Xử lý khi người dùng gửi tin nhắn
 */
export async function execute(message) {
    const messageParts = [];

    // 📜 Ghi nhận text
    if (message.content?.trim()) {
        messageParts.push({ text: message.content.trim() });
    }

    // 🖼️ Ghi nhận file đính kèm
    for (const file of message.attachments.values()) {
        try {
            const localPath = await downloadFile(file.url);
            const detectedMime = file.contentType || "application/octet-stream";

            const uploaded = await ai.files.upload({
                file: localPath,
                config: {
                    displayName: file.name || path.basename(localPath),
                    mimeType: detectedMime,
                },
            });

            messageParts.push({
                fileData: { mimeType: detectedMime, fileUri: uploaded.uri },
            });
        } catch (err) {
            console.error("Error handling attachment", file.name, err);
        }
    }

    // 🚀 Tiến hành chat
    async function runChat() {
        try {
            const history = await getFormattedHistory(message.author.id, message.channel.id);

            const chat = ai.chats.create({
                model: "gemini-2.5-flash",
                history,
                config: { systemInstruction: systemPrompt },
            });

            console.log("Đang gửi tin nhắn đến Gemini...");
            const res = await chat.sendMessage({ message: messageParts });

            if (res?.text) {
                message.channel.send(res.text);

                // 💾 Lưu một lượt chat (user + model) chung 1 document
                await ChatHistory.create({
                    userId: message.author.id,
                    channelId: message.channel.id,
                    turn: {
                        user: messageParts,
                        model: [{ text: res.text }],
                    },
                });
            } else {
                message.channel.send("Có lỗi khi xử lý tin nhắn");
            }
        } catch (error) {
            console.error("Đã xảy ra lỗi:", error.message);
        }
    }

    runChat();
}
