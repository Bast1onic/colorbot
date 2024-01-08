const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildModel = require('../../models/GuildModel.js');

const data = new SlashCommandBuilder()
    .setName('colorban')
    .setDescription('Remove user from local Colorbot blacklist')
    .addUserOption(option => option
        .setName('target')
        .setDescription('The member to unban')
        .setRequired(true))
    .addStringOption(option => option
        .setName('reason')
        .setDescription('The reason for unbanning'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false);

async function execute(interaction) {
    let thisGuild = await GuildModel.findOne({ guildID: interaction.guild.id });
    if (!thisGuild) {
        const newGuild = new GuildModel({ guildID: interaction.guild.id });
        await newGuild.save();
        thisGuild = newGuild;
    }

    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') ?? 'No reason provided';
    const targetInd = thisGuild.banList.findIndex(ele => ele === target.id);
    if (targetInd === -1) {
        await interaction.reply('That user isn\'t banned from Colorbot.');
        return;
    }
    thisGuild.banList.splice(targetInd, 1);

    await thisGuild.save();
    await interaction.reply(`Unbanning ${target.username} for reason: ${reason}`);
}

module.exports = {
    data,
    execute
};
