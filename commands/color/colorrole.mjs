import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import GuildModel from '../../models/GuildModel.js';

const data = new SlashCommandBuilder()
    .setName('colorrole')
    .setDescription('Manage colors')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false);

data.addSubcommand(subcommand => subcommand
    .setName('add')
    .setDescription('Add color to color list')
    .addRoleOption(option => option
        .setName('color')
        .setDescription('The color to add')));
data.addSubcommand(subcommand => subcommand
    .setName('remove')
    .setDescription('Remove color from color list')
    .addRoleOption(option => option
        .setName('color')
        .setDescription('The color to remove')));

async function execute(interaction) {
    const role = interaction.options.getRole('color');
    if (!role) {
        await interaction.reply('Please select a role.');
        return;
    } if (role.permissions.bitfield !== 0n) {
        await interaction.reply('That role has permissions associated with it. It can\'t be used as a color role.');
        return;
    } if (role.color === 0) {
        await interaction.reply('That role doesn\'t have a color.');
        return;
    } if (interaction.guild.roles.cache.find(r => r.name === role.name)) {
        await interaction.reply('You already have a role with that name in the color list. Color names must be unique.');
        return;
    }

    let thisGuild = await GuildModel.findOne({ guildID: interaction.guild.id });
    if (!thisGuild) {
        const newGuild = new GuildModel({ guildID: interaction.guild.id });
        await newGuild.save();
        thisGuild = newGuild;
    }
    const clrIDlist = thisGuild.colorRoles;
    const listInd = clrIDlist.findIndex(ele => ele === role.id);

    if (interaction.options.getSubcommand() === 'add') {
        if (listInd !== -1) {
            await interaction.reply('That role is already in the list');
            return;
        }
        clrIDlist.push(role.id);
        await thisGuild.save();
        await interaction.reply(`Added ${role.name} to list`);
    } else if (interaction.options.getSubcommand() === 'remove') {
        if (listInd === -1) {
            await interaction.reply('That role isn\'t in the list');
            return;
        }
        clrIDlist.splice(listInd, 1);
        await thisGuild.save();
        await interaction.reply(`Removed ${role.name} from list`);
    }
}

const command  = {data, execute};
export default command;
