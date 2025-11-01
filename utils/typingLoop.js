// utils/typingLoop.js
export function startTypingLoop(channel) {
    let stop = false;

    async function loop() {
        while (!stop) {
            try {
                await channel.sendTyping();
                await new Promise((r) => setTimeout(r, 8000)); // Discord typing hiệu lực 10s, gửi lại trước khi hết
            } catch {
                break;
            }
        }
    }

    loop();

    return () => { stop = true; };
}
