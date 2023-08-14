// ========== Packages required ==========
process.env["NODE_CONFIG_DIR"] = __dirname + "/config/";
const config = require('config');
const { Telegraf, Markup } = require('telegraf');
const mongoose = require('mongoose');
const axios = require("axios");

// ========== Modules ==========
const levels = require("./modules/levels");
const ac = require("./modules/accountHandler");

// ========== Database Models ===========
const users = require('./models/user');
const reqs = require('./models/req');
const generalConfigs = require('./models/config');
const accountModel = require('./models/account');
const profiles = require("./models/profile");

// ******************************
// ========== Telegraf ========== 
const bot = new Telegraf(config.get('bot_token'));

// Bot message handler
bot.on('message', (ctx) => {
    
    // let debugChatIds = [98484342,727539725,894815485,77363322,885548849,1771771581];
    // if(!debugChatIds.includes(ctx.chat.id)) return 0;
    
    ctx.telegram.getChatMember(config.get("sponsor_channel"),ctx.chat.id).then(() => {

        // DB Connection
        mongoose.set('strictQuery', true);
        let connectionString = `mongodb://${config.get('db.user')}:${config.get('db.pass')}@${config.get('db.host')}/${config.get('db.db_name')}?authSource=admin`;
        console.log(connectionString);
        mongoose.connect(connectionString,{ useNewUrlParser: true,useUnifiedTopology: true })
        .then(async () => {
            
            // ac.updateCount();
            // let accountsLeftCount = ac.getAccountsCount();
            // ctx.reply("Count: " + accountsLeftCount);
            let message = ctx.message.text;
            let generals = await generalConfigs.Config.findOne({});
            console.log(generals);
            console.log("In you go");
            
            
            // Check if admin
            let isAdmin = false;
            let userObj = await users.User.findOne({telegram_chat_id: ctx.chat.id}).exec();
            if (userObj && userObj.role === "admin") isAdmin = true;
            
            if(!userObj){
                let newUser = new users.User({
                    telegram_chat_id: ctx.chat.id,
                    telegram_username: ctx.chat.username ? ctx.chat.username : null,
                    first_name: ctx.chat.first_name ? ctx.chat.first_name : null,
                    last_name: ctx.chat.last_name ? ctx.chat.last_name : null,
                    level: "home",
                    accounts_purchased: 0,
                    creation_date: (new Date()).toLocaleDateString()
                });
                userObj = await newUser.save();
            }
            
            
            // Start handler and inserting new users
            if(message == '/start' || message == 'start'){
                ctx.reply(levels.general.responses.subscription,Markup.keyboard(levels.home.getKeyboardLayout(isAdmin)).oneTime().resize());
            }
            
            
            // *****************************************
            // ========== User input handler ===========
            // *****************************************
            switch(message){
                case levels.home.buttons.purchase: 
                    if(!generals.service_active){
                        ctx.reply(levels.purchase.responses.notActive);
                        break;
                    }
                    else{
                        if(await profiles.Profile.find({is_used: false}).count() === 0){
                            ctx.reply(levels.purchase.responses.noAccount);
                            break;
                        }
                        else if (await users.User.updateOne({telegram_chat_id:ctx.chat.id},{'$set':{level: 'purchase_1'}})) {
                            ctx.reply(generals.service_description,Markup.keyboard(levels.purchase.getKeyboardLayout()).oneTime().resize());
                        }
                        else{ throw("") }
                        break;
                    }
                    
                case levels.purchase.buttons.accept: 
                    if(!generals.service_active){
                        ctx.reply(levels.purchase.responses.notActive);
                        break;
                    }
                    else{
                        if (await users.User.updateOne({telegram_chat_id:ctx.chat.id},{'$set':{level: 'purchase_2'}})) {
                            ctx.reply(levels.purchase.responses.payment,Markup.keyboard([[levels.general.buttons.back]]).oneTime().resize());
                            ctx.reply(generals.payment_description);
                        }
                        else{ throw("") }
                        break;
                    }
                
                case levels.home.buttons.tutorials:
                    ctx.reply(generals.tutorial_message,Markup.keyboard(levels.home.getKeyboardLayout(isAdmin)).oneTime().resize());
                    break;
                
                case levels.home.buttons.troubleshoot:
                    if(generals.service_troubleshoot_active){
                        ctx.reply(levels.general.responses.troubleshoot);
                        break;
                    }
                    ctx.reply(generals.troubleshoot_message,Markup.keyboard(levels.home.getKeyboardLayout(isAdmin)).oneTime().resize());
                    break;
                
                case levels.home.buttons.checkReq:
                    let userReqs = await reqs.Req.find({telegram_chat_id: ctx.chat.id}).exec();
                    if(userReqs){
                        if (await users.User.updateOne({telegram_chat_id:ctx.chat.id},{'$set':{level: 'user_reqs'}})){
                            ctx.reply(levels.reqs.responses.list,Markup.keyboard(levels.reqs.getKeyboardLayout(userReqs)).oneTime().resize());
                        }
                        else{
                            throw("");
                        }
                    }
                    else{
                        if(userReqs.length === 0){
                            ctx.reply(levels.reqs.responses.noEntity,Markup.keyboard(levels.home.getKeyboardLayout(isAdmin)).oneTime().resize());
                        }
                    }
                    break;
                    
                case levels.general.buttons.back:
                    ctx.reply(levels.general.responses.subscription,Markup.keyboard(levels.home.getKeyboardLayout(isAdmin)).oneTime().resize());
                    break;
                    
                case levels.home.buttons.renewal:
                    if (await users.User.updateOne({telegram_chat_id:ctx.chat.id},{'$set':{level: 'renewal_state'}})) {
                        ctx.reply(levels.renewal.responses.main,Markup.keyboard([[levels.general.buttons.back]]).oneTime().resize());
                    }
                    else{
                        throw("");
                    }
                    break;
                    
                    
                default:
                    let userObj = await users.User.findOne({telegram_chat_id: ctx.chat.id}).exec();
                    if(userObj){
                        if(userObj.level === "purchase_2" && message !== levels.home.buttons.admin){
                            if(ctx.message.photo){
                                let photoFileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
                                if(await new reqs.Req({
                                    telegram_chat_id: ctx.chat.id,
                                    telegram_username: ctx.chat.username,
                                    approved: false,
                                    checked: false,
                                    type: "purchase",
                                    creation_date: new Date().toLocaleDateString(),
                                    screenshot: true,
                                    screenshot_file_id: photoFileId
                                }).save()){
                                    ctx.reply(levels.purchase.responses.success,Markup.keyboard(
                                    [
                                        [levels.general.buttons.back]
                                    ]).oneTime().resize());
                                }
                                else{
                                    throw("متاسفانه خطایی در ثبت تصویر اتفاق افتاد. جهت بررسی و دریافت اکانت به آیدی پشتیبانی پیام دهید");
                                }
                            }
                            else{
                                throw("لطفا اسکرین شات پرداخت خود را ارسال کنید");
                            }
                        }
                        
                        else if(userObj.level === "user_reqs" && message !== levels.home.buttons.admin){
                            let userRefId = (message.split("|")[0]).split(":")[1].trim();
                            let cond = {};
                            if(message.split("|")[0].split(":")[0].trim() !== "تصویر ارسالی"){
                                cond = {ref_id: Number(userRefId)};
                            }
                            else{
                                cond = {_id: mongoose.Types.ObjectId(userRefId)};
                            }
                            let userReq = await reqs.Req.findOne(cond).exec();
                            if(userReq){
                                if(!userReq.checked){
                                    ctx.reply(levels.reqs.responses.waiting);
                                }
                                else{
                                    if(userReq.approved){
                                        cond = userReq.screenshot ? {screenshot_file_id: userReq.screenshot_file_id} : {ref_id: userRefId};
                                        let account = await accountModel.Account.findOne(cond);
                                        if(account){
                                            ctx.telegram.sendMessage(account.telegram_chat_id,levels.purchase.decorateAccount({id: account.account_id,config: account.config_link}),{
                                                parse_mode: "MarkdownV2"
                                            });
                                        }
                                        else{
                                            throw("اکانت پیدا نشد");
                                        }
                                    }
                                    else{
                                        ctx.telegram.sendMessage(userReq.telegram_chat_id,levels.purchase.responses.rejectedPayment + "\n\nشماره رهگیری پرداخت: " + userRefId);
                                    }
                                }
                            }
                            else{
                                throw("خطایی در دریافت درخواست به وجود آمد")
                            }
                        }
                        
                        else if(userObj.level === "renewal_state" && message !== levels.home.buttons.admin){
                            let targetAccount = await accountModel.Account.findOne({$or: [{account_id: message},{config_link: message}]}).exec();
                            if(targetAccount){
                                if(await users.User.updateOne({telegram_chat_id: ctx.chat.id},{'$set':{level: 'renewal_account'}})){
                                    let kb = [];
                                    if(targetAccount.remaining >= -5 && targetAccount.remaining < 6){
                                        kb.push(["تمدید اکانت: " + targetAccount.account_id]);
                                    }
                                    kb.push([levels.general.buttons.back])
                                    bot.telegram.sendMessage(ctx.chat.id,levels.renewal.getDecoratedInfo(targetAccount),{
                                        parse_mode: "MarkdownV2",
                                        reply_markup: {
                                            keyboard: kb,
                                            one_time_keyboard: true,
                                            resize_keyboard: true
                                        }
                                    })
                                }
                                else{
                                    throw("");
                                }
                            }
                            else{
                                ctx.reply(levels.renewal.responses.notFound,Markup.keyboard([[levels.general.buttons.back]]).oneTime().resize());
                            }
                        }
                        
                        else if(userObj.level === "renewal_account" && message !== levels.home.buttons.admin){
                            let id = message.split(":")[1].trim();
                            if(await users.User.updateOne({telegram_chat_id: ctx.chat.id},{'$set':{level: 'renewal_account_level/' + id}})){
                                ctx.reply(generals.service_description);
                                ctx.reply(generals.payment_description);
                                ctx.reply(levels.purchase.responses.payment);
                            }
                            else{
                                throw("");
                            }
                        }
                        
                        else if(userObj.level.includes('renewal_account_level') && message !== levels.home.buttons.admin){
                            let accountId = userObj.level.split("/")[1].trim();
                            if(ctx.message.photo){
                                let photoFileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
                                if(await new reqs.Req({
                                    telegram_chat_id: ctx.chat.id,
                                    telegram_username: ctx.chat.username,
                                    approved: false,
                                    checked: false,
                                    type: "renewal",
                                    renewal_account: accountId,
                                    creation_date: new Date().toLocaleDateString(),
                                    screenshot: true,
                                    screenshot_file_id: photoFileId
                                }).save()){
                                    ctx.reply(levels.purchase.responses.success,Markup.keyboard(
                                    [
                                        [levels.general.buttons.back]
                                    ]).oneTime().resize());
                                }
                                else{
                                    throw("خطایی در ثبت درخواست به وجود آمد. جهت بررسی مشکل و ادامه فرآیند تمدید به آیدی پشتیبانی پیام دهید");
                                }
                            }
                            else{
                                if(!isNaN(Number(message))){
                                    if(await new reqs.Req({
                                        telegram_chat_id: ctx.chat.id,
                                        telegram_username: ctx.chat.username,
                                        ref_id: Number(message),
                                        approved: false,
                                        checked: false,
                                        type: "renewal",
                                        renewal_account: accountId,
                                        creation_date: (new Date()).toLocaleDateString()
                                    }).save()){
                                        ctx.reply(levels.purchase.responses.success,Markup.keyboard(
                                        [
                                            [levels.general.buttons.back]
                                        ]).oneTime().resize());
                                    }
                                    else{
                                        throw("خطایی در ثبت درخواست به وجود آمد. جهت بررسی مشکل و ادامه فرآیند تمدید به آیدی پشتیبانی پیام دهید");
                                    }
                                }
                                else{
                                    throw("کد وارد شده معتبر نمی باشد");
                                }
                            }
                        }
                        
                        // *********************************************
                        // ========== Admin Default Messages ===========
                        // *********************************************
    
                        // Changing service description by admin
                        else if(userObj.level === "changing-service-description"){
                            if(await generalConfigs.Config.updateOne({},{"$set":{service_description: message}})){
                                ctx.reply(levels.admin.responses.success);
                                bot.telegram.sendMessage(ctx.chat.id,levels.admin.responses.menu,{
                                    reply_markup: {
                                        inline_keyboard: levels.admin.getKeyboardLayout(generals)
                                    }
                                });
                            }
                            else{
                                throw("");
                            }
                        }
                        
                        
                        // Changing payment description by admin
                        else if(userObj.level === "changing-payment-description"){
                            if(await generalConfigs.Config.updateOne({},{"$set":{payment_description: message}})){
                                ctx.reply(levels.admin.responses.success);
                                bot.telegram.sendMessage(ctx.chat.id,levels.admin.responses.menu,{
                                    reply_markup: {
                                        inline_keyboard: levels.admin.getKeyboardLayout(generals)
                                    }
                                });
                            }
                            else{
                                throw("");
                            }
                            await users.User.updateOne({telegram_chat_id:ctx.chat.id},{'$set':{level: 'home'}});
                        }
                        
                        
                        // Changing troubleshooting message by admin 
                        else if(userObj.level === "changing-troubleshoot-message"){
                            if(await generalConfigs.Config.updateOne({},{"$set":{troubleshoot_message: message}})){
                                ctx.reply(levels.admin.responses.success);
                                bot.telegram.sendMessage(ctx.chat.id,levels.admin.responses.menu,{
                                    reply_markup: {
                                        inline_keyboard: levels.admin.getKeyboardLayout(generals)
                                    }
                                });
                            }
                            else{
                                throw("");
                            }
                            await users.User.updateOne({telegram_chat_id:ctx.chat.id},{'$set':{level: 'home'}});
                        }
                        
                        
                        // Sending to all message handler
                        else if(userObj.level === "send-to-all"){
                            let allUsers = await users.User.find({}).exec();
                            if(allUsers){
                                allUsers.forEach(item => {
                                    bot.telegram.sendMessage(item.telegram_chat_id,message);
                                })
                                ctx.reply(levels.admin.responses.success);
                                bot.telegram.sendMessage(ctx.chat.id,levels.admin.responses.menu,{
                                    reply_markup: {
                                        inline_keyboard: levels.admin.getKeyboardLayout(generals)
                                    }
                                });
                            }
                            else{
                                throw("");
                            }
                            await users.User.updateOne({telegram_chat_id:ctx.chat.id},{'$set':{level: 'home'}});
                        }
                        
                        // else if(userObj.level === "requesting-account-files"){
                        //     if(ctx.message.document){
                        //         let fileId = ctx.message.document.file_id;
                        //         let telegramFile = await bot.telegram.getFile(fileId);
                        //         if(telegramFile){
                        //             axios.get(`https://api.telegram.org/file/bot${config.get('bot_token')}/${telegramFile.file_path}`).then(getFileRes => {
                        //                 let newProfiles = [];
                        //                 getFileRes.data.forEach(item => {
                        //                     newProfiles.push({
                        //                         config_id: item[1],
                        //                         link: item[2],
                        //                         is_used: false,
                        //                         import_date: (new Date()).toLocaleDateString()
                        //                     });
                        //                 })
                                        
                        //                 profiles.Profile.insertMany(newProfiles).then((res) => {
                        //                     ctx.reply(levels.admin.responses.success);
                        //                 }).catch(err => {
                        //                     ctx.reply(JSON.stringify(err));
                        //                     throw("خطایی در ثبت اکانت ها رخ داد");
                        //                 })
                        //             }).catch(err => {
                        //                 throw("خطایی در افزودن اکانت ها رخ داد");
                        //             });
    
                        //         }
                        //         else{
                        //             throw("");
                        //         }
                        //     }
                        // }
                        
                    }
                    else{
                        throw("");
                    }
            }
            
            
            // ******************************************
            // ========== Admin Input Handler ===========
            // ******************************************
            if(isAdmin){
                if(message === levels.home.buttons.admin){
                    bot.telegram.sendMessage(ctx.chat.id,levels.admin.responses.menu,{
                        reply_markup: {
                            inline_keyboard: levels.admin.getKeyboardLayout(generals,await profiles.Profile.find({is_used: false}).count())
                        }
                    });
                }
                
                bot.action(/^admin/,async (ctx) => {
                    
                    let type = ctx.update.callback_query.data.split("%")[1];
                    let cbId = ctx.update.callback_query.id;
    
                    switch(type){
                        case "service-description":
                            ctx.answerCbQuery();
                            if (await users.User.updateOne({telegram_chat_id:ctx.chat.id},{'$set':{level: 'changing-service-description'}})){
                                ctx.reply(levels.admin.responses.changeReq);
                            }
                            
                            else{
                                throw("");
                            }
                            
                            break;
                        
                        case "payment-description":
                            ctx.answerCbQuery();
                            if (await users.User.updateOne({telegram_chat_id:ctx.chat.id},{'$set':{level: 'changing-payment-description'}})){
                                ctx.reply(levels.admin.responses.changeReq);
                            }
                            
                            else{
                                throw("");
                            }
                            
                            break;
                            
                        case "send-all":
                            ctx.answerCbQuery();
                            if (await users.User.updateOne({telegram_chat_id:ctx.chat.id},{'$set':{level: 'send-to-all'}})){
                                ctx.reply(levels.admin.responses.changeReq);
                            }
                            
                            else{
                                throw("");
                            }
                            
                            break;
                            
                        case "troubleshoot-message":
                            ctx.answerCbQuery();
                            if (await users.User.updateOne({telegram_chat_id:ctx.chat.id},{'$set':{level: 'changing-troubleshoot-message'}})){
                                ctx.reply(levels.admin.responses.changeReq);
                            }
                            
                            else{
                                throw("");
                            }
                            
                            break;
                            
                        case "add-accounts":
                            ctx.answerCbQuery();
                            if (await users.User.updateOne({telegram_chat_id:ctx.chat.id},{'$set':{level: 'requesting-account-files'}})){
                                ctx.reply(levels.admin.responses.accountReq);
                            }
                            
                            else{
                                throw("");
                            }
                            
                            break;
                            
                        case "service-status":
                            if (await users.User.updateOne({telegram_chat_id:ctx.chat.id},{'$set':{level: 'home'}}) && await generalConfigs.Config.updateOne({},{"$set": {service_active: !generals.service_active}})){
                                
                                generals = await generalConfigs.Config.findOne({}).exec();
                                ctx.deleteMessage();
                                bot.telegram.sendMessage(ctx.chat.id,levels.admin.responses.menu,{
                                    reply_markup: {
                                        inline_keyboard: levels.admin.getKeyboardLayout(generals)
                                    }
                                });
                            }
                            
                            else{
                                throw("");
                            }
                            
                            break;
                        
                        case "troubleshoot-status":
                            if (await users.User.updateOne({telegram_chat_id:ctx.chat.id},{'$set':{level: 'home'}}) && await generalConfigs.Config.updateOne({},{"$set": {service_troubleshoot_active: !generals.service_troubleshoot_active}})){
                                
                                generals = await generalConfigs.Config.findOne({}).exec();
                                ctx.deleteMessage();
                                bot.telegram.sendMessage(ctx.chat.id,levels.admin.responses.menu,{
                                    reply_markup: {
                                        inline_keyboard: levels.admin.getKeyboardLayout(generals)
                                    }
                                });
                            }
                            
                            else{
                                throw("");
                            }
                            
                            break;
    
                        case "view-stats":
                            let usersCount = await users.User.find({}).count();
                            let activeUsersIds = [];
                            let allaccs = await reqs.Req.find({});
                            allaccs.forEach(item => {
                                if(!activeUsersIds.includes(item.telegram_chat_id)){
                                    activeUsersIds.push(item.telegram_chat_id);
                                }
                            })
                            ctx.reply(levels.admin.getStatsString({
                                users: usersCount,
                                activeUsers: activeUsersIds.length,
                                accounts: allaccs.length
                            }));
                            break;
                            
                        case "new-reqs":
                            userObj.level = "admin_new_reqs";
                            if(await userObj.save()){
                                let newReqs = await reqs.Req.find({checked: false, screenshot: false}).exec();
                                if(newReqs){
                                
                                    ctx.deleteMessage();
                                    bot.telegram.sendMessage(ctx.chat.id,levels.admin.responses.menu,{
                                        reply_markup: {
                                            inline_keyboard: levels.admin.getReqsKeyboardLayout(newReqs)
                                        }
                                    });
                                    
                                }
                                break;
                            }
                            else{
                                throw("به روزرسانی سطح انجام نشد");
                            }
                        
                        case "new-reqs-screenshot":
                            let newReq = await reqs.Req.findOne({checked: false, screenshot: true}).exec();
                            let rCount = await reqs.Req.find({checked: false, screenshot: true}).count();
                            if (newReq){
                                if(await users.User.updateOne({telegram_chat_id:ctx.chat.id},{'$set':{level: 'admin-screenshot'}})){
                                    ctx.deleteMessage();
                                    bot.telegram.sendPhoto(ctx.chat.id,newReq.screenshot_file_id,{
                                        reply_markup: {
                                            inline_keyboard: levels.admin.getScreenshotReqKeyboard(newReq,rCount)
                                        }
                                    });
                                }
                            }
                            break;
                            
                        default:
                        
                            if(type.includes("req-approve")){
                                
                                // Checking request type
                                let id = type.split('-')[2];
                                let req = await reqs.Req.findOne({_id: id}).exec();
                                if(req.checked){
                                    return;
                                }
                                if(req.type !== "renewal"){
                                    // Get new account
                                    
                                    // Insert new account into db
                                    let newAccount = new accountModel.Account({
                                        telegram_chat_id: req.telegram_chat_id,
                                        telegram_username: req.telegram_username,
                                        ref_id: req.ref_id === null ? null : req.ref_id,
                                        screenshot_file_id: (req.screenshot && req.screenshot_file_id !== null) ? req.screenshot_file_id : null,
                                        account_id: account.config_id,
                                        config_link: account.link,
                                        remaining: 30,
                                        creation_date: new Date().toLocaleDateString()
                                    });
                        
                                    newAccount.save().then(async (value) => {
                        
                                        // Change account status
                                        account.is_used = true;
                                        account.save();
                        
                                        // Checks accounts left
                                        let accountsLeft = await profiles.Profile.find({is_used: false}).count();
                                        if(accountsLeft <= 20){
                                            ctx.sendMessage("تعداد اکانت باقی مانده در ربات: " + accountsLeft);
                                        }
                        
                                        req.approved = true;
                                        req.checked = true;
                                        
                                        if(await req.save()){
                                            bot.telegram.sendMessage(req.telegram_chat_id,levels.purchase.decorateAccount({id: account.config_id,config: account.link}),{
                                                parse_mode: "MarkdownV2"
                                            });
                                            
                                            // Set new keyboard
                                            let user = await users.User.findOne({telegram_chat_id: ctx.chat.id}).exec();
                                            if(user){
                                                user.accounts_purchased += 1;
                                                user.save();
                                                
                                                if(user.level === "admin-screenshot"){
                                                    let newReq = await reqs.Req.findOne({checked: false, screenshot: true}).exec();
                                                    let rCount = await reqs.Req.find({checked: false, screenshot: true}).count();
                                                    if (newReq && rCount){
                                                        bot.telegram.sendPhoto(ctx.chat.id,newReq.screenshot_file_id,{
                                                            reply_markup: {
                                                                inline_keyboard: levels.admin.getScreenshotReqKeyboard(newReq,rCount)
                                                            }
                                                        });
                                                    }
                                                    else{
                                                        ctx.reply("درخواست جدیدی وجود ندارد");
                                                    }
                                                }
                                                else{
                                                    let newReqs = await reqs.Req.find({checked: false, screenshot: false}).exec();
                                                    ctx.deleteMessage();
                                                    bot.telegram.sendMessage(ctx.chat.id,levels.admin.responses.menu,{
                                                        reply_markup: {
                                                            inline_keyboard: levels.admin.getReqsKeyboardLayout(newReqs)
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                        else{
                                            throw(`
                                            ذخیره اکانت در دیتابیس با موفقیت انجام شد.
                                            به روزرسانی درخواست به حالت تایید شده ناموفق بود.
                                            اطلاعات اکانت برای کاربر ارسال نگردید
                                            `);
                                        }
                                        
                                    }).catch(e => {
                                        throw("ذخیره اکانت در دیتابیس ناموفق بود");
                                    })
                            
                                }
                                else{
                            
                                    // Renewal
                                    let cAccountId = req.renewal_account;
                                    let cAccount = await accountModel.Account.findOne({account_id: cAccountId}).exec();
                                    cAccount.remaining += 30;
                                    if(await cAccount.save()){
                                        req.approved = true;
                                        req.checked = true;
                                        if(await req.save()){
                                            bot.telegram.sendMessage(cAccount.telegram_chat_id,levels.renewal.getSuccessMessage(cAccountId));
                                            
                                            // Set new keyboard
                                            let user = await users.User.findOne({telegram_chat_id: ctx.chat.id}).exec();
                                            if(user){
                                                
                                                user.accounts_purchased += 1;
                                                user.save();
                                                if(user.level === "admin-screenshot"){
                                                    let newReq = await reqs.Req.findOne({checked: false, screenshot: true}).exec();
                                                    let rCount = await reqs.Req.find({checked: false, screenshot: true}).count();
                                                    if (newReq && rCount){
                                                        bot.telegram.sendPhoto(ctx.chat.id,newReq.screenshot_file_id,{
                                                            reply_markup: {
                                                                inline_keyboard: levels.admin.getScreenshotReqKeyboard(newReq,rCount)
                                                            }
                                                        });
                                                    }
                                                    else{
                                                        ctx.reply("درخواست جدیدی وجود ندارد");
                                                    }
                                                }
                                                else{
                                                    let newReqs = await reqs.Req.find({checked: false, screenshot: false}).exec();
                                                    ctx.deleteMessage();
                                                    bot.telegram.sendMessage(ctx.chat.id,levels.admin.responses.menu,{
                                                        reply_markup: {
                                                            inline_keyboard: levels.admin.getReqsKeyboardLayout(newReqs)
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                        else{
                                            throw("به روزسانی اکانت با موفقیت انجام شد. تغییر وضعیت درخواست به تایید شده ناموفق بود.")
                                        }
                                    }
                                    else{
                                        throw("تمدید ناموفق بود");
                                    }
                            
                                }
                                
                                
    
                            }
                            
                            if(type.includes("req-reject")){
                                let user = await users.User.findOne({telegram_chat_id: ctx.chat.id}).exec();
                                let id = type.split('-')[2];
                                if(await reqs.Req.updateOne({_id: id},{approved: false,checked: true})){
                                    if(user){
                                        if(user.level === "admin-screenshot"){
                                            let newReq = await reqs.Req.findOne({checked: false, screenshot: true}).exec();
                                            let rCount = await reqs.Req.find({checked: false, screenshot: true}).count();
                                            if (newReq){
                                                ctx.deleteMessage();
                                                bot.telegram.sendPhoto(ctx.chat.id,newReq.screenshot_file_id,{
                                                    reply_markup: {
                                                        inline_keyboard: levels.admin.getScreenshotReqKeyboard(newReq,rCount)
                                                    }
                                                });
                                            }
                                            else{
                                                ctx.deleteMessage();
                                                ctx.reply("درخواست جدیدی وجود ندارد");
                                            }
                                        }
                                        else{
                                            let newReqs = await reqs.Req.find({checked: false, screenshot: false}).exec();
                                            bot.telegram.sendMessage(ctx.chat.id,levels.admin.responses.menu,{
                                                reply_markup: {
                                                    inline_keyboard: levels.admin.getReqsKeyboardLayout(newReqs)
                                                }
                                            });
                                        }
                                    }
                                    reqs.Req.findOne({_id: id}).exec().then(req => {
                                        let refCode = req.screenshot ? id : req.ref_id;
                                        ctx.telegram.sendMessage(req.telegram_chat_id,levels.purchase.responses.rejectedPayment + "\n\nشماره رهگیری پرداخت/آی دی تصویر: " + refCode );
                                    });
                                }
                                
                                else{
                                    ctx.answerCbQuery("خطایی پیش آمد مجددا تلاش کنید");
                                }
                            }
                    }
                })
                
            }
        
        
        // ***********************************
        // ======== Exception Handler ========
        // ***********************************
        }).catch(e => {
            if(e === "" || e.length === 0){
                ctx.reply("متاسفانه خطایی پیش آمد. دوباره تلاش کنید");
            }
            else{
                ctx.reply(e);
            }
            return 0;
        });

    }).catch(()=>{
        ctx.reply(levels.general.responses.notsub);
    })
    
    
})


bot
	.launch({ webhook: { domain: config.get("domain"), port: config.get("port") } })
	.then(() => console.log("Webhook bot listening on port", config.get("port")));
