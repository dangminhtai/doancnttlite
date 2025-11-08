import dotenv from 'dotenv'
dotenv.config()
import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js'
import path from "path";
import { fileURLToPath } from "url";
import { loadCommands, deployCommands } from './deployCommands.js'
import { connectDB } from './db.js';
import Command from './models/Command.js';
import onReady from './events/Client/onReady.js';
import messageCreate from './events/Client/messageCreate.js';
import interactionCreate from './events/Client/interactionCreate.js';
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel]
});
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
client.commands = new Collection()
onReady(client);
messageCreate(client);
interactionCreate(client);


import express from "express";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "web", "build")));

app.get("/api/commands", async (req, res) => {
    try {
        const commands = await Command.find().lean();
        res.json(commands);
    } catch (err) {
        console.error("Lỗi lấy danh sách command:", err);
        res.status(500).json({ error: "Lỗi server" });
    }
});
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "web", "build", "index.html"));
});


app.listen(PORT, () => console.log(`Server đang chạy tại http://localhost:${PORT}`));
async function main() {
    try {
        await connectDB();
        const commandsPath = path.join(__dirname, 'commands')
        const commands = await loadCommands(commandsPath, client);
        await deployCommands(commands);
        await client.login(process.env.DISCORD_TOKEN);
    } catch (err) {
        console.error('Lỗi khi kết nối và khởi động BOT', err);
    }
}
main();
