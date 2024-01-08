const { SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');
const GuildModel = require('../../models/GuildModel.js');

const data = new SlashCommandBuilder()
    .setName('colorban')
    .setDescription('Add user to local Colorbot blacklist')
    .addUserOption(option => option
        .setName('target')
        .setDescription('The member to ban')
        .setRequired(true))
    .addStringOption(option => option
        .setName('reason')
        .setDescription('The reason for banning'))
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
    if (target.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        await interaction.reply(`Cannot ban target user ${target.username} because they can manage roles.`);
        return;
    }
    const reason = interaction.options.getString('reason') ?? 'No reason provided';
    thisGuild.banList.append(target.id);

    await thisGuild.save();
    await interaction.reply(`Banning ${target.username} for reason: ${reason}`);
}

module.exports = {
    data,
    execute
};
