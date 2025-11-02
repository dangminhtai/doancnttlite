import { startTypingLoop } from "../../utils/typingLoop.js";
import { AIService } from "../../services/AIService.js";
import { AttachmentService } from "../../services/AttachmentService.js";
import { ChatHistoryService } from "../../services/ChatHistoryService.js";
import { sendSafeMessage } from "../../utils/sendSafeMessage.js"; // ✅ thêm dòng này

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
    if (!isMentioned && !isReplyToBot && !isMemiChat) return;

    const userId = message.author.id;
    const channelId = message.channel.id;

    const aiService = new AIService();
    const chatHistoryService = new ChatHistoryService();
    const attachmentService = new AttachmentService();
    const messageParts = [];

    const cleanContent = message.content?.replaceAll(`<@!?${botId}>`, "").trim();
    if (cleanContent) messageParts.push({ text: cleanContent });

    const stopTyping = startTypingLoop(message.channel);

    try {
        const attachmentParts = await attachmentService.processAttachments(message.attachments, aiService);
        messageParts.push(...attachmentParts);

        const history = await chatHistoryService.getUserHistory(userId, channelId);
        const chat = aiService.createChat(history);
        const replyText = await aiService.sendMessage(chat, messageParts);

        stopTyping();
        await sendSafeMessage(message, replyText); // ✅ thay thế message.reply
        await chatHistoryService.saveTurn(userId, channelId, messageParts, [{ text: replyText }]);
    } catch (err) {
        stopTyping();
        console.error("Lỗi Gemini (server):", err.message);
        await sendSafeMessage(message, "Lỗi khi xử lý phản hồi từ AI");
    }
}
