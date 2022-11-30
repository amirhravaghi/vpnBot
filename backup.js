// ========== Packages required ==========
process.env["NODE_CONFIG_DIR"] = __dirname + "/config/";
const config = require('config');
const { Telegraf, Markup } = require('telegraf');
const mongoose = require('mongoose');
const JSZip = require('jszip');
const fs = require('fs');

// ========== Database Models ===========
const users = require('./models/user');
const accountModel = require('./models/account');
const profiles = require('./models/profile');
const reqs = require('./models/req');
const configModel = require('./models/config');

// ******************************
const bot = new Telegraf(config.get('bot_token'));
const zip = new JSZip();

// DB Connection
mongoose.connect(`mongodb://${config.get('db.user')}:${config.get('db.pass')}@${config.get('db.host')}:${config.get("db.port")}/${config.get('db.db_name')}?authSource=admin`,{ useNewUrlParser: true,useUnifiedTopology: true })
.then(async () => {

    let date = new Date().toISOString().replaceAll(':','-').split('.')[0];

    // Db folder
    const folder = zip.folder(`${config.get('db.db_name')}-${date}`);

    // Data fetch
    let usersJson = JSON.parse(await users.User.find({}));
    let configsJson = JSON.parse(await configModel.Config.find({}));
    let accountsJson = JSON.parse(await accountModel.Account.find({}));
    let profilesJson = JSON.parse(await profiles.Profile.find({}));
    let reqsJson = JSON.parse(await reqs.Req.find({}));

    // Create JSON Files
    folder.file(`users-${date}.json`,usersJson);
    folder.file(`configs-${date}.json`,configsJson);
    folder.file(`accounts-${date}.json`,accountsJson);
    folder.file(`profiles-${date}.json`,profilesJson);
    folder.file(`reqs-${date}.json`,reqsJson);

    zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
        .pipe(fs.createWriteStream(`backup/backup-${date}.zip`))
        .on('finish', function () {
            console.log("zip written.");
            bot.telegram.sendDocument("+JvQIWxXBZetiN2E0",`backup/backup-${date}.zip`);
        });

}).catch(err => {
    console.log(err);
})