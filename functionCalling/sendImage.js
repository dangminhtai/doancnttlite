import { AIService } from "../services/AIService.js";
import { AttachmentBuilder } from "discord.js";
const ai = new AIService();

export async function sendImage(send_image, messageParts, message) {
    if (!send_image) return;

    let progress = 0;
    const progressMsg = await message.channel.send("🖼️ Đang tạo ảnh... 0%");

    const interval = setInterval(async () => {
        progress += Math.floor(Math.random() * 8) + 31;
        if (progress >= 95) progress = 95;
        try {
            await progressMsg.edit(`🖼️ Đang tạo ảnh... ${progress}%`);
        } catch { }
    }, 2000);

    try {
        const response = await ai.sendImageText(messageParts);
        const part = response.candidates[0].content.parts.find(p => p.inlineData);
        clearInterval(interval);

        if (!part) {
            await progressMsg.edit("Không tạo được ảnh theo yêu cầu.");
            return console.error("❌ Không có inlineData trong phản hồi Gemini.");
        }

        const imageBase64 = part.inlineData.data;
        const buffer = Buffer.from(imageBase64, "base64");
        const attachment = new AttachmentBuilder(buffer, { name: "image.png" });

        await progressMsg.edit("Đã tạo hình ảnh");
        await message.channel.send({ files: [attachment] });
    } catch (err) {
        clearInterval(interval);
        console.error("🔥 Lỗi khi tạo hoặc gửi ảnh:", err);
        await progressMsg.edit("Đã xảy ra lỗi khi tạo ảnh.");
    }
}
