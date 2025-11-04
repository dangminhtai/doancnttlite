import { startTypingLoop } from "../../utils/typingLoop.js";
import { AIService } from "../../services/AIService.js";
import { AttachmentService } from "../../services/AttachmentService.js";
import { ChatHistoryService } from "../../services/ChatHistoryService.js";
import { sendImage } from "../../functionCalling/sendImage.js";
export async function execute(message) {
    const userId = message.author.id;
    const channelId = message.channel.id;
    const aiService = new AIService();
    const chatHistoryService = new ChatHistoryService();
    const attachmentService = new AttachmentService();
    const messageParts = [];

    if (message.content?.trim()) messageParts.push({ text: message.content.trim() });
    // bật typing giả
    const stopTyping = startTypingLoop(message.channel);
    const attachmentParts = await attachmentService.processAttachments(message.attachments, aiService);
    messageParts.push(...attachmentParts);
    const history = await chatHistoryService.getUserHistory(userId, channelId);



    try {
        const res = await aiService.genContent(messageParts);

        if (res.functionCalls?.length > 0) {
            const funcCall = res.functionCalls[0];
            const sendImg = funcCall.args?.send_image;
            await sendImage(sendImg, messageParts, message);
            stopTyping();
        }
        else {
            const chat = aiService.createChat(history);
            const replyText = await aiService.sendMessage(chat, messageParts);
            stopTyping();
            await message.channel.send(replyText);
            await chatHistoryService.saveTurn(userId, channelId, messageParts, [{ text: replyText }]);
        }

    } catch (err) {
        stopTyping();
        console.error("Lỗi Gemini:", err.message);
        await message.channel.send("Lỗi khi xử lý phản hồi từ AI");
    }
}
