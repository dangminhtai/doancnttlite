// commands/clear-history.js
import { SlashCommandBuilder } from "discord.js";
import ChatHistory from "../models/ChatHistory.js";

export default {
    data: new SlashCommandBuilder()
        .setName("clear-history")
        .setDescription("Xóa lịch sử chat của bot trong kênh hoặc DM")
        .addStringOption(option =>
            option.setName("scope")
                .setDescription("Phạm vi cần xóa")
                .setRequired(true)
                .addChoices(
                    { name: "DM (toàn bộ lịch sử riêng của bạn)", value: "dm" },
                    { name: "Server (toàn bộ lịch sử của kênh này)", value: "server" },
                    { name: "Server (riêng bạn trong kênh này)", value: "user-in-server" },
                )
        ),

    async execute(interaction) {
        const scope = interaction.options.getString("scope");
        const userId = interaction.user.id;
        const channelId = interaction.channel.id;

        await interaction.deferReply({ ephemeral: true });

        try {
            let query = {};
            if (scope === "dm") query = { userId };
            else if (scope === "server") query = { channelId };
            else if (scope === "user-in-server") query = { userId, channelId };

            const existing = await ChatHistory.countDocuments(query);

            if (existing === 0) {
                await interaction.editReply("Không có lịch sử chat nào để xóa 🌸");
                return;
            }

            const result = await ChatHistory.deleteMany(query);
            if (result.deletedCount > 0) {
                if (scope === "dm")
                    await interaction.editReply("Đã xóa toàn bộ lịch sử chat riêng của bạn 🧸");
                else if (scope === "server")
                    await interaction.editReply("Đã xóa toàn bộ lịch sử chat trong kênh này 🧹");
                else
                    await interaction.editReply("Đã xóa lịch sử chat của bạn trong kênh này 🌼");
            } else {
                await interaction.editReply("Không có dữ liệu nào bị xóa 💫");
            }
        } catch (err) {
            console.error(err);
            await interaction.editReply("Đã xảy ra lỗi khi xóa lịch sử chat 🍀");
        }
    },
};
