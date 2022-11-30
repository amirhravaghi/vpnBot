let levels = {
    general: {
        responses:{
            subscription: `
            سلام
به ربات گارد پراکسی خوش آمدید

با استفاده از این ربات شما میتوانید خدمات زیر را به راحتی در اختیار داشته باشید
- خرید اکانت
- تمدید و بررسی وضعیت اکانت
- دریافت آموزش های لازم
- دریافت اطلاعیه ها و پیام های همگانی
- رفع کندی و قطعی های اتصال
            `,
            troubleshoot: "🔹 در حال حاضر سرویس در دست تعمیر می باشد. مشکلات قطعی و یا اختلال شما تا ساعات آینده برطرف خواهد شد"
        },
        buttons: {
            back: "🔙 بازگشت به منوی اصلی"  
        }
    },
    admin: {
        responses:{
            menu: `
            🎛 منوی ادمین

با استفاده از منوی زیر میتوانید تنظیمات مورد نظر را بر روی ربات اعمال کرده و یا از امکانات مختلف ادمین استفاده کنید
            `,
            changeReq: "لطفا متن مورد نظر خود را ارسال کنید",
            success: "عملیات با موفقیت انجام شد",
            accountReq: "لطفا فایل های اکانت را ارسال کنید",
        },
        buttons: {
            serviceDescription: "تغییر متن توضیحات سرویس",
            paymentDescription: "تغییر متن روش پرداخت",
            sendAllMessage: "ارسال پیام همگانی",
            troubleshootMessage: "تغییر متن رفع قطعی و کندی",
            serviceStatus: "سرویس دهی",
            troubleshootStatus: "حالت تعمیر",
            serviceActive: "✅ فعال",
            serviceNotActive: "❌ غیرفعال",
            viewNewReqs: "مشاهده و تایید پرداخت ها",
            addAccount: "افزودن اکانت",
            viewNewReqsScreenShot: "مشاهده و تایید پرداخت های اسکرین شاتی"
        },
        getKeyboardLayout: (configs, accountsCount) => {
            let kb = [
                [{text: levels.admin.buttons.serviceDescription, callback_data: "admin%service-description"}],
                [{text: levels.admin.buttons.paymentDescription, callback_data: "admin%payment-description"}],
                [{text: levels.admin.buttons.sendAllMessage, callback_data: "admin%send-all"}],
                [{text: levels.admin.buttons.troubleshootMessage, callback_data: "admin%troubleshoot-message"}],
                [{text: levels.admin.buttons.addAccount, callback_data: "admin%add-accounts"}],
                [{text: levels.admin.buttons.serviceStatus, callback_data: "admin%service-status"},{text: (configs.service_active ? levels.admin.buttons.serviceActive : levels.admin.buttons.serviceNotActive), callback_data: "admin%service-status"}],
                [{text: levels.admin.buttons.troubleshootStatus, callback_data: "admin%troubleshoot-status"},{text: (configs.service_troubleshoot_active ? levels.admin.buttons.serviceActive : levels.admin.buttons.serviceNotActive), callback_data: "admin%troubleshoot-status"}],
                [{text: levels.admin.buttons.viewNewReqs, callback_data: "admin%new-reqs"}],
                [{text: levels.admin.buttons.viewNewReqsScreenShot, callback_data: "admin%new-reqs-screenshot"}],
                [{text: `تعداد اکانت باقی مانده: ${accountsCount}`, callback_data: "admin$accounts-count"}]
            ];
            return kb;
        },
        getReqsKeyboardLayout: (reqs) => {
            let kb = [];
            for(let i=0;i<10;i++){
                if(reqs[i]){
                    let item = reqs[i];
                    kb.push([
                    {text: `u/c: ${item.telegram_username ? item.telegram_username : item.telegram_chat_id} / ref: ${item.ref_id}`, callback_data: "label"}],
                    [{text: '✅', callback_data:`admin%req-approve-${item._id}`},
                    {text: '❌', callback_data:`admin%req-reject-${item._id}`}]);
                    
                }
            }
            kb.push(
                [{text: `Remaining: ${reqs.length}`, callback_data: "remaining"}]
            );
            return kb;
        },
        getScreenshotReqKeyboard: (req,remaining) => {
            return [
                    [{text: `u/c: ${req.telegram_username ? req.telegram_username : req.telegram_chat_id}`, callback_data: "reqUsername"}],
                    [{text: '✅', callback_data:`admin%req-approve-${req._id}`},
                    {text: '❌', callback_data:`admin%req-reject-${req._id}`}],
                    [{text: `Remaining: ${remaining}`, callback_data: "remaining"}]
            ];
        },
        getAccountsToShut: (ids) => {
            return `اکانت هایی که تمدید نکرده و باید قطع شوند: \n\n ${ids} \n\n`;
        }
    },
    home: {
        response: "به ربات گارد پراکسی خوش آمدید",
        buttons: {
            purchase: "🛒 خرید سرویس جدید",
            troubleshoot: "🔧 رفع مشکل قطعی و کندی",
            renewal: "🧾 وضعیت / تمدید سرویس",
            tutorials: "🪄 آموزش نصب و راه اندازی",
            checkReq: "🔍 پیگیری پرداخت ها",
            admin: "⚙️ ادمین"
        },
        getKeyboardLayout: (admin = false) => {
            let kb = [
                [levels.home.buttons.renewal,levels.home.buttons.purchase],
                [levels.home.buttons.troubleshoot,levels.home.buttons.tutorials],
                [levels.home.buttons.checkReq]
            ];
            if(admin) kb.push([levels.home.buttons.admin])
            return kb;
        }
    },
    purchase: {
        responses:{
            payment: `
            🧾 لطفا پس از پرداخت شماره پیگیری/ارجاع را به صورت انگلیسی، و یا تصویر اسکرین شات از پرداخت خود را به ربات ارسال نمایید

⚠️دقت داشته باشید که در هر بار خرید از ربات، تنها یک اکانت قابل خریداری است. بنابراین از پرداخت مبلغ های بیشتر از هزینه یک اکانت خودداری کنید.
✅ در صورتی که قصد خرید چند اکانت دارید میتوانید هر خرید را جداگانه انجام دهید. همچنین در صورتی که قصد همکاری در فروش و یا خرید عمده را دارید میتوانید با اکانت پشتیبانی در ارتباط باشید
            `,
            success: `
            ✅ پرداخت شما در انتظار تایید است. به محض تایید، اکانت شما از طریق ربات ارسال خواهد شد.
⚠️ با توجه به زیاد بودن تعداد درخواست ها، این فرآیند ممکن است تا یک روز کاری زمان ببرد

در صورت وجود هر گونه مشکل و یا ابهام میتوانید به پشتیبانی با آیدی ( @GuardProxy_support ) پیام دهید
            `,
            accountHeader: `
            ✅ پرداخت شما تایید شد
🔹اکانت وی پی ان شما:`,
            accountFooter: "*برای آموزش استفاده از اکانت میتوانید از بخش آموزش ها در ربات استفاده نمایید*",
            rejectedPayment: "❌ متاسفانه پرداخت شما تایید نشد. جهت بررسی های بیشتر به ادمین پشتیبانی (@guardproxy_support) پیام دهید",
            notActive: `
            🙏 با عرض پوزش در حال حاضر از سرویس دهی معذور می باشیم
آغاز سرویس دهی مجدد از طریق ربات اطلاع رسانی خواهد شد
            `,
            noAccount: "🙏 متاسفانه در حال حاضر ظرفیت اکانت ها به پایان رسیده است. لطفا بعدا مجدد تلاش فرمایید"
        },
        buttons: {
            accept: "☑️ مرحله بعدی (پرداخت)",
        },
        getKeyboardLayout: () => {
            return [
                [levels.purchase.buttons.accept],
                [levels.general.buttons.back]
            ];
        },
        decorateAccount: (account) => {
            return levels.purchase.responses.accountHeader + "\n\n" + "*آیدی:*\n" + account.id + "\n\n*لینک اکانت:*\n```" + account.config + "```\n\n" + levels.purchase.responses.accountFooter;
        }
    },
    reqs: {
        responses: {
            noEntry: "🔻 تا به حال هیچ درخواستی از سمت شما در ربات ثبت نشده است",
            list: `
            ☑️ درخواست های زیر تا به حال برای شما ثبت شده اند

در هر درخواست:
- کد رهگیری پرداخت / آیدی تصویر ارسالی
- تاریخ
- وضعیت تایید درخواست

مشخص شده اند.

با انتخاب درخواست هایی که وضعیت آن ها تایید شده می باشد میتوانید اطلاعات اکانت وی پی ان آن درخواست را مشاهده کنید
            `,
            waiting: "این درخواست همچنان در انتظار تایید است. در صورتی که مدت زیادی از ثبت درخواست گذشته میتوانید با آیدی پشتیبانی (@guardproxy_support) در ارتباط باشید",
        },
        getKeyboardLayout: (reqs) => {
            let kb = [];
            reqs.forEach((item) => {
                let itemType = item.screenshot ? "تصویر ارسالی: " : "کد رهگیری پرداخت: ";
                let itemId = item.screenshot ? item._id : item.ref_id
                kb.push([itemType + itemId + " | " + (item.checked ? (item.approved ? "✅ تایید شده" : "❌ رد شده") : "🔍 در انتظار تایید") + " | " + item.creation_date]);
            });
            kb.push([levels.general.buttons.back]);
            return kb;
        }
    },
    renewal: {
        responses: {
            main: `
            🔹لطفا آیدی و یا لینک اکانت مورد نظر را ارسال نمایید


⚠️ در صورتی که خرید اولیه اکانت خود را از طریق ربات انجام نداده اید و ربات قادر به پیدا کردن اکانت شما نیست، میتوانید از بخش "خرید سرویس جدید" از منوی اصلی، اقدام به خرید اکانت جدید بفرمایید.
            
تمدید اکانت هایی که از طریق ربات خریداری می شوند، از همین بخش و با ارسال یادآوری های مختلف انجام خواهد شد
            `,
            notFound: "اکانت مورد نظر در سیستم یافت نشد",
            fiveDays: `
            ⚠️ توجه
تنها 5 روز از مدت زمان اکانت شما باقی مانده است. از امروز میتوانید در بخش "وضعیت / تمدید سرویس" اکانت خود را تمدید کنید 

آیدی اکانت: `,
            zeroDays: `
            ⚠️ توجه
امروز آخرین روز از زمان باقی مانده اکانت شماست. شما می توانید در بخش "وضعیت / تمدید سرویس" اکانت خود را تمدید کنید 

آیدی اکانت: `,
            mFiveDays: `
            ⚠️ توجه
در حال حاضر 5 روز از اعتبار قانونی اکانت شما گذشته است. امروز آخرین مهلت تمدید اکانت است و در صورت عدم تمدید، اکانت شما قطع خواهد شد. / با تشکر

آیدی اکانت: `
        },
        getDecoratedInfo: (account) => {
            remaining = account.remaining < 0 ? ("منفی " + Math.abs(account.remaining)) : account.remaining;
            return "*اطلاعات اکانت:*\n\nوضعیت: " + (account.remaining > -5 ? "✅ فعال" :"❌ غیرفعال") + "\nمدت زمان باقی مانده: " + remaining + " روز\n*دکمه تمدید در صورتی که کمتر از 5 روز از اعتبار شما باقی مانده باشد فعال میشود*\n\n\n" + "*اطلاعات دسترسی حساب وی پی ان شما:*" + "\n" + "*آیدی:*\n" + account.account_id + "\n\n*لینک اکانت:*\n```" + account.config_link + "```\n\n" + levels.purchase.responses.accountFooter;
        },
        getSuccessMessage: (accountId) => {
            return `
            ✅ اکانت شما با موفقیت تمدید شد

آیدی اکانت: ${accountId}
            `;
        }
    }
}

module.exports = levels;