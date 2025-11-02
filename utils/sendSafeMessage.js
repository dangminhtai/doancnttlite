import { AttachmentBuilder } from "discord.js";
import fs from "fs";
import path from "path";

export async function sendSafeMessage(message, content) {
    if (!content) return;

    if (typeof content !== "string") {
        content = String(content);
    }

    if (content.length <= 2000) {
        await message.reply(content);
        return;
    }

    const filePath = path.join(process.cwd(), "long_message.md");
    fs.writeFileSync(filePath, content, "utf-8");

    const file = new AttachmentBuilder(filePath);
    await message.reply({
        content: "Tin nhắn quá dài, xem file 👉",
        files: [file],
    });

    fs.unlinkSync(filePath);
}
