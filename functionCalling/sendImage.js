import { AIService } from "../services/AIService.js";
import * as fs from "node:fs";
import { AttachmentBuilder } from "discord.js";
const ai = new AIService();
export async function sendImage(send_image, messageParts, message) {
    if (!send_image) return;

    try {
        const response = await ai.sendImageText(messageParts);
        const part = response.candidates[0].content.parts.find(p => p.inlineData);
        if (!part) {
            await message.channel.send("Không tạo được ảnh theo yêu cầu.");
            return console.error("❌ Không có inlineData trong phản hồi Gemini.");
        }

        const imageBase64 = part.inlineData.data;
        const buffer = Buffer.from(imageBase64, "base64");
        const attachment = new AttachmentBuilder(buffer, { name: "image.png" });
        await message.channel.send({ files: [attachment] });
    } catch (err) {
        console.error("🔥 Lỗi khi tạo hoặc gửi ảnh:", err);
        await message.channel.send("Đã xảy ra lỗi khi tạo ảnh.");
    }
}
