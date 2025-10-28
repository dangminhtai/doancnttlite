import dotenv from "dotenv";
import path from "path";
import { downloadFile } from "../../logic/downloadFile.js";
import { GoogleGenAI } from "@google/genai";
import { systemPrompt } from "../../config/systemPrompt/vn.js";
import ChatHistory from "../../models/ChatHistory.js";

dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * 🧠 Hàm lấy và định dạng lịch sử chat từ MongoDB
 */
async function getFormattedHistory(userId, channelId) {
    try {
        const historyFromDb = await ChatHistory.find({ userId, channelId }).sort({ createdAt: "asc" });

        if (!historyFromDb || historyFromDb.length === 0) {
            return []; // Trả về mảng rỗng nếu chưa có lịch sử
        }

        return historyFromDb.map((record) => ({
            role: record.role,
            parts: record.messageParts.map((part) => {
                if (part.text) return { text: part.text };
                if (part.fileData && part.fileData.fileUri) {
                    return {
                        fileData: {
                            mimeType: part.fileData.mimeType,
                            fileUri: part.fileData.fileUri,
                        },
                    };
                }
                return {};
            }),
        }));
    } catch (error) {
        console.error("Lỗi khi lấy lịch sử chat:", error);
        return [];
    }
}

/**
 * ✨ Hàm chính xử lý khi người dùng gửi tin nhắn
 */
export async function execute(message) {
    const messageParts = [];

    if (message.content && message.content.trim()) {
        messageParts.push({ text: message.content.trim() });
    }

    // 🖼️ Xử lý tệp đính kèm
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

            const fileUri = uploaded.uri;
            console.log("Uploaded fileUri:", fileUri);

            messageParts.push({
                fileData: {
                    mimeType: detectedMime,
                    fileUri,
                },
            });
        } catch (err) {
            console.error("Error handling attachment", file.name, err);
        }
    }

    // 🚀 Bắt đầu chat
    async function runChat() {
        try {
            const history = await getFormattedHistory(message.author.id, message.channel.id);

            const chat = ai.chats.create({
                model: "gemini-2.5-flash",
                history: history, // có thể rỗng, không sao
                config: {
                    systemInstruction: systemPrompt,
                },
            });

            console.log("Đang gửi tin nhắn đến Gemini...");
            const res = await chat.sendMessage({
                message: messageParts,
            });

            // 💾 Lưu tin nhắn người dùng
            await ChatHistory.create({
                userId: message.author.id,
                channelId: message.channel.id,
                role: "user",
                messageParts,
            });

            // 💬 Gửi phản hồi và lưu tin nhắn AI
            if (res && res.text) {
                message.channel.send(res.text);

                await ChatHistory.create({
                    userId: message.author.id,
                    channelId: message.channel.id,
                    role: "model",
                    messageParts: [{ text: res.text }],
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
