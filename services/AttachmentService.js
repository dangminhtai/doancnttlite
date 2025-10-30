import path from "path";
import { downloadFile } from "../logic/downloadFile.js";

export class AttachmentService {
    async processAttachments(attachments, aiService) {
        const messageParts = [];
        for (const file of attachments.values()) {
            try {
                const localPath = await downloadFile(file.url);
                const mimeType = file.contentType || "application/octet-stream";
                const uri = await aiService.uploadFile(localPath, file.name || path.basename(localPath), mimeType);
                messageParts.push({ fileData: { mimeType, fileUri: uri } });
            } catch (err) {
                console.error("Error handling attachment", file.name, err);
            }
        }
        return messageParts;
    }
}
