import { Type } from "@google/genai"
// export const resSchema = {
//     type: Type.OBJECT,
//     description: "Kết quả phản hồi của bạn bao gồm văn bản tin nhắn và hình ảnh nếu được yêu cầu",
//     properties: {
//         message: {
//             type: Type.STRING,
//             description: "Nội dung tin nhắn mà bạn sẽ phản hồi cho người dùng"
//         },
//         send_image: {
//             type: Type.BOOLEAN,
//             description: "Nếu true, bạn sẽ gửi thêm ảnh theo yêu cầu của người dùng"
//         }
//     },
//     required: ['message', 'send_image']
// }
export const sendResFunction = {
    name: 'send_response',
    description: 'Xử lý yêu cầu liên quan đến hình ảnh từ người dùng, bao gồm việc tạo, chỉnh sửa hoặc gửi hình ảnh khi mô hình xác định rằng phản hồi nên ở dạng hình ảnh thay vì chỉ văn bản.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            send_image: {
                type: Type.BOOLEAN,
                description: 'Giá trị true nếu người dùng yêu cầu hoặc ngữ cảnh phản hồi đòi hỏi phải tạo/gửi hình ảnh minh họa thay vì văn bản.',
            }
        },
        required: ['send_image']
    }
};
