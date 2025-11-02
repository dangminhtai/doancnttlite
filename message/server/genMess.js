import { startTypingLoop } from "../../utils/typingLoop.js";
import { AIService } from "../../services/AIService.js";
import { AttachmentService } from "../../services/AttachmentService.js";
import { ChatHistoryService } from "../../services/ChatHistoryService.js";

export async function execute(message) {
    if (message.author.bot) return;

    const botId = message.client.user.id;
    const isMentioned = message.mentions.has(botId);
    let isReplyToBot = false;
    if (message.reference?.messageId) {
        try {
            const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
            isReplyToBot = repliedMessage.author.id === message.client.user.id;
        } catch (err) {
            console.warn("Không thể fetch tin nhắn gốc:", err.message);
        }
    }

    const isMemiChat = message.channel.name === "memi-chat";

    // nếu không phải 1 trong 3 điều kiện -> bỏ qua
    if (!isMentioned && !isReplyToBot && !isMemiChat) return;

    const userId = message.author.id;
    const channelId = message.channel.id;

    const aiService = new AIService();
    const chatHistoryService = new ChatHistoryService();
    const attachmentService = new AttachmentService();
    const messageParts = [];

    // xóa mention bot trong nội dung (cho đỡ nhảm)
    const cleanContent = message.content?.replaceAll(`<@!?${botId}>`, "").trim();
    if (cleanContent) messageParts.push({ text: cleanContent });

    const stopTyping = startTypingLoop(message.channel);

    try {
        const attachmentParts = await attachmentService.processAttachments(message.attachments, aiService);
        messageParts.push(...attachmentParts);

        const history = await chatHistoryService.getUserHistory(userId, channelId);
        // console.log("Lịch sử chat nhận được:\n" + JSON.stringify(history, null, 2));
        const chat = aiService.createChat(history);
        const replyText = await aiService.sendMessage(chat, messageParts);

        stopTyping();
        await message.reply(replyText);
        await chatHistoryService.saveTurn(userId, channelId, messageParts, [{ text: replyText }]);
    } catch (err) {
        stopTyping();
        console.error("Lỗi Gemini (server):", err.message);
        await message.channel.send("Lỗi khi xử lý phản hồi từ AI");
    }
}
