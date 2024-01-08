const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    memberID: {
        type: String,
        required: true
    },
    // id of color role
    colorRole: {
        type: String
    }
});

const MemberModel = mongoose.model('Member', memberSchema);

module.exports = MemberModel;
