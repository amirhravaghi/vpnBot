const mongoose = require('mongoose');

const Account = mongoose.model('account',new mongoose.Schema({
    telegram_chat_id: Number,
    telegram_username: {type: String, default: null},
    ref_id: {type: Number, default: null},
    screenshot_file_id: {type: String, default: null},
    account_id: String,
    config_link: String,
    remaining: Number,
    creation_date: String,
}));


module.exports = {
    Account
};