
export class AttachmentService {
    async processAttachments(attachments, aiService) {
        const messageParts = [];
        for (const file of attachments.values()) {
            try {
                const rawMime = file.contentType || "application/octet-stream";
                const mimeType = rawMime.split(";")[0].trim();

                const uri = await aiService.uploadFromUrl(file.url, file.name, mimeType);
                messageParts.push({ fileData: { mimeType, fileUri: uri } });
            } catch (err) {
                console.error("Error handling attachment", file.name, err);
            }
        }
        return messageParts;
    }
}
