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
    name: 'send_respond',
    description: 'Quyết định có nên tạo hình ảnh cho người dùng hay không?',
    parameters: {
        type: Type.OBJECT,
        properties: {
            send_image: {
                type: Type.BOOLEAN,
                description: "True khi người dùng yêu cầu bạn tạo hình ảnh, hàm sẽ được gọi để bên thứ 3 tạo ảnh",
            }
        },
        required: ['send_image']
    }
};