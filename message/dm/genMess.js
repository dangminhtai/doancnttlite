import { AIService } from "../../services/AIService.js";
import { AttachmentService } from "../../services/AttachmentService.js";
import { ChatHistoryService } from "../../services/ChatHistoryService.js";

export async function execute(message) {
    const userId = message.author.id;
    const channelId = message.channel.id;
    const aiService = new AIService();
    const chatHistoryService = new ChatHistoryService();
    const attachmentService = new AttachmentService();
    const messageParts = [];

    if (message.content?.trim()) messageParts.push({ text: message.content.trim() });

    const attachmentParts = await attachmentService.processAttachments(message.attachments, aiService);

    messageParts.push(...attachmentParts);

    const history = await chatHistoryService.getUserHistory(userId, channelId);

    try {
        const chat = aiService.createChat(history);
        const replyText = await aiService.sendMessage(chat, messageParts);
        await message.channel.send(replyText);
        await chatHistoryService.saveTurn(userId, channelId, messageParts, [{ text: replyText }]);
    }
    catch (err) {
        console.error("Lỗi Gemini:", err.message);
        await message.channel.send("Lỗi khi xử lý phản hồi từ AI");
    }
}
