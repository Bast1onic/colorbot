import mongoose from 'mongoose';
import MemberModel from './MemberModel.js';

const guildSchema = new mongoose.Schema({
    guildID: {
        type: String,
        required: true
    },
    colorRoles: {
        type: [String],
        default: []
    },
    // roles which are allowed to use non-admin bot commands
    allowedRoles: {
        type: [String],
        default: []
    },
    memberList: {
        type: [MemberModel.schema],
        default: []
    },
    // ids of users banned from using bot commands, in case of abuse
    banList: {
        type: [String],
        default: []
    },
    numUses: {
        type: Number,
        default: 0
    }
});

const GuildModel = mongoose.model('Guild', guildSchema);

export default GuildModel;
