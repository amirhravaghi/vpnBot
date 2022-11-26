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
mongoose.connect(`mongodb://${config.get('db.user')}:${config.get('db.pass')}@${config.get('db.host')}:${config.get("db.port")}/${config.get('db.db_name')}?authSource=admin`,{ useNewUrlParser: true,useUnifiedTopology: true })
.then(async () => {

    accountModel.Account.updateMany({},{"$inc":{remaining: -1}}).then((res) => {
        accountModel.Account.find({}).exec().then(async (data) => {
            
            let fiveAccounts = [];
            let zeroAccounts = [];
            let mfiveAccounts = [];
            let accountsToShut = [];
            
            data.forEach((item) => {
                if(item.remaining === 5){
                    fiveAccounts.push(item);
                } 
                if(item.remaining === 0){
                    zeroAccounts.push(item);
                }
                if(item.remaining === -5){
                    mfiveAccounts.push(item);
                }
                if(item.remaining <= -6){
                    accountsToShut.push(item);
                }
            });
            
            fiveAccounts.forEach(item => {
                bot.telegram.sendMessage(item.telegram_chat_id,levels.renewal.responses.fiveDays + item.account_id);
            })
            zeroAccounts.forEach(item => {
                bot.telegram.sendMessage(item.telegram_chat_id,levels.renewal.responses.zeroDays + item.account_id);
            })
            mfiveAccounts.forEach(item => {
                bot.telegram.sendMessage(item.telegram_chat_id,levels.renewal.responses.mFiveDays + item.account_id);
            })
            
            if(accountsToShut.length > 0){
                let atsIds = "";
                accountsToShut.forEach(item => {
                    atsIds += `\n${item.account_id},`;
                })
                users.User.find({role: "admin"}).exec().then(data => {
                    
                    data.forEach(admin => {
                        bot.telegram.sendMessage(admin.telegram_chat_id,levels.admin.getAccountsToShut(atsIds));
                    });
                    
                }).catch(e => {
                    throw(e);
                });
            }
            
        }).catch(e => {
            throw(e);
        });
    }).catch(e => {
        throw(e);
    })

// ***********************************
// ======== Exception Handler ========
// ***********************************
}).catch(e => {
    console.log(e);
    return 0;
});