const { SlashCommandBuilder } = require('discord.js');
const GuildModel = require('../../models/GuildModel.js');

const data = new SlashCommandBuilder()
    .setName('colorlist')
    .setDescription('See available colors')
    .setDMPermission(false);

async function execute(interaction) {
    let thisGuild = await GuildModel.findOne({ guildID: interaction.guild.id });
    if (!thisGuild) {
        const newGuild = new GuildModel({ guildID: interaction.guild.id });
        await newGuild.save();
        thisGuild = newGuild;
    }
    if (thisGuild.banList.includes(interaction.member.id)) { return; }

    const clrIDlist = thisGuild.colorRoles;
    if (!clrIDlist.length) {
        await interaction.reply('There are currently no color roles registered.');
    } else {
        const colorRoleNames = [];
        clrIDlist.forEach(item => { colorRoleNames.push(interaction.guild.roles.cache.get(item).name); });
        await interaction.reply(`Colors:\n${colorRoleNames.join(', ')}`);
    }
}

module.exports = {
    data,
    execute
};
