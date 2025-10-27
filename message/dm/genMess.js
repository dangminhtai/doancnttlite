
import dotenv from 'dotenv';
import mime from 'mime-types';
import path from 'path';
import fs from "fs";
import { GoogleGenAI } from '@google/genai';
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function downloadFile(url, dest = './temp') {
    const fileName = path.basename(new URL(url).pathname);
    const filePath = path.join(dest, fileName);

    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Không tải được file (${res.status})`);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));
    return filePath;
}

export async function execute(message) {
    const messageParts = [];

    if (message.content && message.content.trim()) {
        messageParts.push({ text: message.content.trim() });
    }

    // attachments -> upload to GoogleGenAI and push as fileData parts
    for (const file of message.attachments.values()) {
        try {
            // 1) tải file về tạm
            const localPath = await downloadFile(file.url); // dùng hàm bạn đã có
            const detectedMime = mime.lookup(localPath) || file.contentType || 'application/octet-stream';

            // 2) upload lên GoogleGenAI
            const uploaded = await ai.files.upload({
                file: localPath,
                config: {
                    displayName: file.name || path.basename(localPath),
                    mimeType: detectedMime,
                },
            });

            // uploaded thường có .name (e.g. "files/abc...") và .uri
            const fileUri = uploaded.uri || uploaded.name || uploaded.file?.uri;

            // 3) push vào messageParts
            messageParts.push({
                fileData: {
                    mimeType: detectedMime,
                    fileUri, // dùng URI trả về từ API Google
                },
            });
        } catch (err) {
            console.error('Error handling attachment', file.name, err);
            // nếu muốn, có thể push thông tin lỗi hoặc skip
        }
    }

    console.log('Đã chuyển tin nhắn', messageParts);
}
