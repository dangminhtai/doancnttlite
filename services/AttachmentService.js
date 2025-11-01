
export class AttachmentService {
    async processAttachments(attachments, aiService) {
        const messageParts = [];
        for (const file of attachments.values()) {
            try {
                const mimeType = file.contentType || "application/octet-stream";
                const uri = await aiService.uploadFromUrl(file.url, file.name, mimeType);
                messageParts.push({ fileData: { mimeType, fileUri: uri } });
            } catch (err) {
                console.error("Error handling attachment", file.name, err);
            }
        }
        return messageParts;
    }
}
