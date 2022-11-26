// ========== Packages required ==========
process.env["NODE_CONFIG_DIR"] = __dirname + "/config/";
const config = require('config');
const { Telegraf, Markup } = require('telegraf');
const mongoose = require('mongoose');

// ========== Database Models ===========
const users = require('./models/user');
const accountModel = require('./models/account');

// ========== Modules ==========
const levels = require("./modules/levels");


// ******************************
// ========== Telegraf ========== 
const bot = new Telegraf(config.get('bot_token'));

// DB Connection
mongoose.connect(`mongodb://${config.get('db.user')}:${config.get('db.pass')}@${config.get('db.host')}:${config.get('db.port')}/${config.get('db.db_name')}?authSource=${config.get('db.db_name')}`,{ useNewUrlParser: true,useUnifiedTopology: true })
.then(async () => {

    bot.telegram.sendMessage(98484342,"CJ Test");

// ***********************************
// ======== Exception Handler ========
// ***********************************
}).catch(e => {
    console.log(e);
    return 0;
});