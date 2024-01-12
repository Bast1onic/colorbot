const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildModel = require('../../models/GuildModel.js');

const data = new SlashCommandBuilder()
    .setName('colorperms')
    .setDescription('Manage roles needed for bot use')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false);

data.addSubcommand(subcommand => subcommand
    .setName('add')
    .setDescription('Add role to perms list')
    .addRoleOption(option => option
        .setName('role')
        .setDescription('The role to add')));
data.addSubcommand(subcommand => subcommand
    .setName('remove')
    .setDescription('Remove role from perms list')
    .addRoleOption(option => option
        .setName('role')
        .setDescription('The color to remove')));

async function execute(interaction) {
    const role = interaction.options.getRole('role');
    if (!role) {
        await interaction.reply('Please select a role.');
        return;
    }

    let thisGuild = await GuildModel.findOne({ guildID: interaction.guild.id });
    if (!thisGuild) {
        const newGuild = new GuildModel({ guildID: interaction.guild.id });
        await newGuild.save();
        thisGuild = newGuild;
    }
    const listInd = thisGuild.allowedRoles.findIndex(ele => ele === role.id);

    if (interaction.options.getSubcommand() === 'add') {
        if (listInd !== -1) {
            await interaction.reply('That role is already in the list');
            return;
        }
        thisGuild.allowedRoles.push(role.id);
        await thisGuild.save();
        await interaction.reply(`Added ${role.name} to perms list`);
    } else if (interaction.options.getSubcommand() === 'remove') {
        if (listInd === -1) {
            await interaction.reply('That role isn\'t in the list');
            return;
        }
        thisGuild.allowedRoles.splice(listInd, 1);
        await thisGuild.save();
        await interaction.reply(`Removed ${role.name} from perms list`);
    }
    const rolesString = thisGuild.allowedRoles.map(ele => interaction.guild.roles.cache.find(r => r.id === ele).name).join(',');
    await interaction.reply(`Current allowed roles: ${rolesString}`);
}

module.exports = {
    data,
    execute
};
