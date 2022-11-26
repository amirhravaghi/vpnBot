const mongoose = require('mongoose');

const Config = mongoose.model('Config',new mongoose.Schema({
    service_description: String,
    payment_description: String,
    service_active: Boolean,
    service_troubleshoot_active: Boolean,
    troubleshoot_message: String,
    tutorial_message: String,
    accounts_left: Number
}));


module.exports = {
    Config
};