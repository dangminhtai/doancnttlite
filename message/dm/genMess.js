
import dotenv from 'dotenv';
import path from 'path';
import { downloadFile } from '../../logic/downloadFile.js';
import { GoogleGenAI } from '@google/genai';
import { systemPrompt } from '../../config/systemPrompt/vn.js'
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function execute(message) {
    const messageParts = [];
    if (message.content && message.content.trim()) {
        messageParts.push({ text: message.content.trim() });
    }
    for (const file of message.attachments.values()) {
        try {

            const localPath = await downloadFile(file.url);
            const detectedMime = file.contentType || 'application/octet-stream';
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
            console.log("Message parts:", messageParts);
        } catch (err) {
            console.error('Error handling attachment', file.name, err);
        }
    }

    async function runChat() {
        try {
            const chat = ai.chats.create({
                model: "gemini-2.5-flash",
                history: userHistory,
                config: {
                    // tools: [
                    //     {
                    //         googleSearch: {
                    //         }
                    //     }
                    // ],
                    systemInstruction: systemPrompt,
                }

            });
            console.log("Đang gửi tin nhắn đến Gemini...");
            const res = await chat.sendMessage({
                message: messageParts,
            });
            if (res) {
                message.channel.send(res.text);
            }
            else {
                message.channel.send('Có lỗi khi xử lý tin nhắn');
            }

        } catch (error) {
            console.error("Đã xảy ra lỗi:", error.message);
        }
    }
    runChat();
}
