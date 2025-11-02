// utils/sendSafeMessage.js
export async function sendSafeMessage(message, content) {
    if (!content) return;

    // Nếu là object hoặc mảng thì stringify để tránh lỗi
    if (typeof content !== "string") {
        content = String(content);
    }

    // Discord giới hạn 2000 ký tự mỗi tin nhắn
    const chunks = content.match(/[\s\S]{1,2000}/g);

    for (const chunk of chunks) {
        await message.reply(chunk);
    }
}
