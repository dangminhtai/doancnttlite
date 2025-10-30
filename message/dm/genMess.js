import dotenv from "dotenv";
import path from "path";
import { downloadFile } from "../../logic/downloadFile.js";
import { GoogleGenAI } from "@google/genai";
import { systemPrompt } from "../../config/systemPrompt/vn.js";
import ChatHistory from "../../models/ChatHistory.js";

dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function execute(message) {
    const userId = message.author.id;
    const channelId = message.channel.id;

    // 🧩 1️⃣ Chuẩn bị parts cho tin nhắn user
    const messageParts = [];
    if (message.content && message.content.trim()) {
        messageParts.push({ text: message.content.trim() });
    }

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
                fileData: {
                    mimeType: detectedMime,
                    fileUri: uploaded.uri,
                },
            });
        } catch (err) {
            console.error("Error handling attachment", file.name, err);
        }
    }

    // 🧠 2️⃣ Lấy lịch sử chat của user
    const userData = await ChatHistory.findOne({ userId, channelId }).lean();
    let userHistory = [];

    if (userData) {
        // Flatten all turns -> [{ role, parts }]
        for (const turn of userData.turns) {
            if (turn.user?.parts?.length)
                userHistory.push({ role: "user", parts: turn.user.parts });
            if (turn.model?.parts?.length)
                userHistory.push({ role: "model", parts: turn.model.parts });
        }
    }

    // 🤖 3️⃣ Tạo đối tượng chat Gemini
    try {
        const chat = ai.chats.create({
            model: "gemini-2.5-flash",
            history: userHistory,
            config: { systemInstruction: systemPrompt },
        });

        console.log("Đang gửi tin nhắn đến Gemini...");
        const res = await chat.sendMessage({ message: messageParts });

        // 💬 4️⃣ Gửi phản hồi và lưu lịch sử
        const replyText = res?.text || "Không có phản hồi từ AI";

        await message.channel.send(replyText);

        if (userData) {
            // Thêm turn mới vào document có sẵn
            await ChatHistory.updateOne(
                { userId, channelId },
                {
                    $push: {
                        turns: {
                            user: { parts: messageParts },
                            model: { parts: [{ text: replyText }] },
                        },
                    },
                }
            );
        } else {
            // Tạo document mới nếu chưa có
            await ChatHistory.create({
                userId,
                channelId,
                turns: [
                    {
                        user: { parts: messageParts },
                        model: { parts: [{ text: replyText }] },
                    },
                ],
            });
        }
    } catch (error) {
        console.error("Đã xảy ra lỗi:", error.message);
        await message.channel.send("Lỗi khi xử lý phản hồi từ AI");
    }
}
