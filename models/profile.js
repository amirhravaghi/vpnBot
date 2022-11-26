const mongoose = require('mongoose');

const Profile = mongoose.model('profile',new mongoose.Schema({
    config_id: String,
    link: String,
    is_used: {type: Boolean, default: false},
    import_date: String
}));


module.exports = {
    Profile
};