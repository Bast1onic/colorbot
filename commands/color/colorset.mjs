import { SlashCommandBuilder } from 'discord.js';
import GuildModel from '../../models/GuildModel.js';
import MemberModel from '../../models/MemberModel.js';

const data = new SlashCommandBuilder()
    .setName('colorset')
    .setDescription('Set your color')
    .addStringOption(option => option
        .setName('color')
        .setDescription('Color to set your name to')
        .setRequired(true))
    .setDMPermission(false);

async function execute(interaction) {
    const member = interaction.member;
    const roleChoice = interaction.guild.roles.cache.find(r => r.name === interaction.options.getString('color'));
    let thisGuild = await GuildModel.findOne({ guildID: interaction.guild.id });
    if (!thisGuild) {
        const newGuild = new GuildModel({ guildID: interaction.guild.id });
        await newGuild.save();
        thisGuild = newGuild;
    }
    if (thisGuild.banList.includes(member.id)
        || !member.roles.cache.some(role => thisGuild.allowedRoles.includes(role.id))) {
        return;
    }

    const clrIDlist = thisGuild.colorRoles;
    if (!roleChoice || !clrIDlist.find(ele => ele === roleChoice.id)) {
        await interaction.reply('That\'s not a color role.');
    } else {
        // due to rate limits need to modify local cached list of roles
        const memberRoles = member.roles.cache.reduce((acc, cur) => {
            acc.push(cur);
            return acc;
        }, []);

        // if for some reason member already has the role
        if (memberRoles.includes(roleChoice)) {
            await interaction.reply('You already have that color, silly.');
            return;
        }
        const memberRecord = thisGuild.memberList.find(ele => ele.memberID === member.id);
        if (memberRecord) {
            const oldRoleIdx = memberRoles.findIndex(ele => ele.id === memberRecord.colorRole);
            // check if role on record is on user
            if (oldRoleIdx !== -1) {
                // delete role
                memberRoles.splice(oldRoleIdx, 1);
            }
            memberRecord.colorRole = roleChoice.id;
        } else {
            const newMemberRecord = new MemberModel({
                memberID: member.id,
                colorRole: roleChoice.id });
            thisGuild.memberList.push(newMemberRecord);
        }
        // add new color
        memberRoles.push(roleChoice);

        member.roles.set(memberRoles).catch(err => { console.log(err); });
        thisGuild.numUses += 1;
        await thisGuild.save();
        await interaction.reply(`Success! Changed your color to ${roleChoice.name}.`);
    }
}

const command  = {data, execute};
export default command;
