const config = require("config");
const axios = require("axios");
const fs = require("fs");

const accountHandler = {
    
    
    
    // Pull Account
    getAccount: function(ctx = null) {
        return new Promise(async(resolve,reject) => {
            try{
                let data = fs.readFileSync("accounts.json","utf-8");
                let parsedData = JSON.parse(data);
                if(parsedData.length === 0){
                    resolve({
                        id: "",
                        config: "",
                        accountsLeft: 0,
                    })
                }
                let account = parsedData.pop();
                ctx.reply(JSON.stringify(account));
                await fs.writeFile("accounts.json",JSON.stringify(parsedData),(err) => {
                    if(err) reject(err);
                });
                resolve({
                    id: account[1],
                    config: account[2],
                    accountsLeft: parsedData.length,
                });
            }
            catch(err){
                reject(err);
            }
        });
    },
    
    // Push new accounts
    pushAccounts: function(newAccounts) {
        return new Promise((resolve,reject)=>{
            fs.readFile("accounts.json",(err,data)=>{
                if(err) reject(err);
                let parsedData = JSON.parse(data);
                let newData = [...parsedData,...newAccounts];
                fs.writeFile("accounts.json",JSON.stringify(newData),(error)=>{
                    if(error){
                        reject(error);
                    }
                    else{
                        resolve(newData.length);
                    }
                });
            });
        });
    },
    
    // Adds from file
    addFromFile: async function (telegramFilePath) {
        let res = await axios.get(`https://api.telegram.org/file/bot${config.get('bot_token')}/${telegramFilePath}`);
        if(res){
            return accountHandler.pushAccounts(res.data);
        }
        else{
            return false;
        }
    },
    
}

module.exports = accountHandler;