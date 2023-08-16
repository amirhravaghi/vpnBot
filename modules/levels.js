let levels = {
    general: {
        responses:{
            notsub: `کاربر گرامی  
            به هایپرشاپ خوش اومدی 
            برای شروع کار با ربات و خرید اشتراک بر روی /start کلیک کن`,
            subscription: `
            سلام
به ربات هایپر وی پی ان خوش آمدید

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
            configReq: "لطفا کانفیگ مورد نظر را وارد کنید"
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
            viewNewReqsScreenShot: "مشاهده و تایید پرداخت های اسکرین شاتی",
        },
        getKeyboardLayout: (configs) => {
            let kb = [
                [{text: levels.admin.buttons.serviceDescription, callback_data: "admin%service-description"}],
                [{text: levels.admin.buttons.paymentDescription, callback_data: "admin%payment-description"}],
                [{text: levels.admin.buttons.sendAllMessage, callback_data: "admin%send-all"}],
                [{text: levels.admin.buttons.troubleshootMessage, callback_data: "admin%troubleshoot-message"}],
                [{text: levels.admin.buttons.serviceStatus, callback_data: "admin%service-status"},{text: (configs.service_active ? levels.admin.buttons.serviceActive : levels.admin.buttons.serviceNotActive), callback_data: "admin%service-status"}],
                [{text: levels.admin.buttons.troubleshootStatus, callback_data: "admin%troubleshoot-status"},{text: (configs.service_troubleshoot_active ? levels.admin.buttons.serviceActive : levels.admin.buttons.serviceNotActive), callback_data: "admin%troubleshoot-status"}],
                [{text: levels.admin.buttons.viewNewReqsScreenShot, callback_data: "admin%new-reqs-screenshot"}],
            ]; 
            return kb;
        },
        getReqsKeyboardLayout: (reqs) => {
            let kb = [];
            for(let i=0;i<10;i++){
                if(reqs[i]){
                    let item = reqs[i];
                    kb.push(
                    [{text: `u/c: ${item.telegram_username ? item.telegram_username : item.telegram_chat_id} / ref: ${item.ref_id}`, callback_data: "label"}],
                    [{text: `${item.plan ? item.plan : "پلن مشخص نشده"}`, callback_data: "label"}],
                    [{text: `${item.operator ? item.operator : "اپراتور مشخص نشده"}`, callback_data: "label"}],
                    [{text: `وارد کردن کانفیگ اکانت`, callback_data: `admin%add-config-${item._id}`}],
                    [{text: '✅', callback_data:`admin%req-approve-${item._id}`},
                    {text: '❌', callback_data:`admin%req-reject-${item._id}`}]);
                }
            }
            kb.push(
                [{text: `درخواست های باقی مانده: ${reqs.length}`, callback_data: "remaining"}]
            );
            return kb;
        },
        getScreenshotReqKeyboard: (req,remaining) => {
            return [
                    [{text: `u/c: ${req.telegram_username ? req.telegram_username : req.telegram_chat_id}`, callback_data: "reqUsername"}],
                    [{text: `${item.plan ? item.plan : "پلن مشخص نشده"}`, callback_data: "label"}],
                    [{text: `${item.operator ? item.operator : "اپراتور مشخص نشده"}`, callback_data: "label"}],
                    [{text: `وارد کردن کانفیگ اکانت`, callback_data: `admin%add-config-${item._id}`}],
                    [{text: '✅', callback_data:`admin%req-approve-${req._id}`},
                    {text: '❌', callback_data:`admin%req-reject-${req._id}`}],
                    [{text: `درخواست های باقی مانده: ${remaining}`, callback_data: "remaining"}]
            ];
        },
        getAccountsToShut: (ids) => {
            return `اکانت هایی که تمدید نکرده و باید قطع شوند: \n\n ${ids} \n\n`;
        },
        getStatsString: (data) => {
            return `
✅ آمار ربات

تعداد کاربران: ${data.users}
تعداد کاربرانی که تا به حال اکانت خریداری کرده اند: ${data.activeUsers}
تعداد اکانت های فروخته شده: ${data.accounts}
            `;
        }
    },
    home: {
        response: "به ربات هایپر وی پی ان خوش آمدید",
        buttons: {
            purchase: "🛒 خرید سرویس جدید",
            troubleshoot: "👤 ارتباط با پشتیبانی",
            renewal: "🧾 وضعیت / تمدید سرویس",
            tutorials: "🪄 آموزش نصب و راه اندازی",
            checkReq: "🔍 پیگیری پرداخت ها",
            admin: "⚙️ ادمین"
        },
        getKeyboardLayout: (admin = false) => {
            let kb = [
                [levels.home.buttons.purchase],
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
🧾 لطفا پس از پرداخت، اسکرین شات صفحه پرداخت خود را برای ربات ارسال کنید

⚠️دقت داشته باشید که در هر بار خرید از ربات، تنها یک اکانت قابل خریداری است. بنابراین از پرداخت مبلغ های بیشتر از هزینه یک اکانت خودداری کنید.
✅ در صورتی که قصد خرید چند اکانت دارید میتوانید هر خرید را جداگانه انجام دهید. همچنین در صورتی که قصد همکاری در فروش و یا خرید عمده را دارید میتوانید با اکانت پشتیبانی در ارتباط باشید
            `,
            success: `
            ✅ پرداخت شما در انتظار تایید است. به محض تایید، اکانت شما از طریق ربات ارسال خواهد شد.
⚠️ با توجه به زیاد بودن تعداد درخواست ها، این فرآیند ممکن است تا یک روز کاری زمان ببرد

در صورت وجود هر گونه مشکل و یا ابهام میتوانید به پشتیبانی پیام دهید
            `,
            accountHeader: `
            ✅ پرداخت شما تایید شد
🔹اکانت وی پی ان شما:`,
            accountFooter: "*برای آموزش استفاده از اکانت میتوانید از بخش آموزش ها در ربات استفاده نمایید*",
            rejectedPayment: "❌ متاسفانه پرداخت شما تایید نشد. جهت بررسی های بیشتر به ادمین پشتیبانی پیام دهید",
            notActive: `
            🙏 با عرض پوزش در حال حاضر از سرویس دهی معذور می باشیم
آغاز سرویس دهی مجدد از طریق ربات اطلاع رسانی خواهد شد
            `,
            noAccount: "🙏 متاسفانه در حال حاضر ظرفیت اکانت ها به پایان رسیده است. لطفا بعدا مجدد تلاش فرمایید"
        },
        buttons: {
            accept: "☑️ مرحله بعدی (پرداخت)",
            operators: {
                op1: "همراه اول",
                op2: "ایرانسل و رایتل"
            }
        },
        getKeyboardOperatorLayout: () => {
            return [
                [levels.purchase.buttons.operators.op1,levels.purchase.buttons.operators.op2],
                [levels.general.buttons.back]
            ];
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
    plans: {
        responses:{
            menu: "یکی از پلن ها را انتخاب کنید"
        },
        buttons: {
            p1: "یک ماهه -سرور Special - تک کاربره : ۲۰۰ هزار تومان",
            p2: "یک ماهه -سرور Special - دو کاربره : ۳۰۰ هزار تومان",
            p3: "یک ماهه - سرور Unique - تک کاربره : ۳۵۰ هزار تومان",
            p4: "یک ماهه - سرور Unique - دو کاربره : ۵۰۰ هزار تومان",
            p5: "دو ماهه - سرور Special  - تک کاربره :  ۳۵۰ هزار تومان",
            p6: "دو ماهه - سرور Special - دو کاربره : ۵۰۰ هزار تومان",
            p7: "دو ماهه - سرور Unique - تک کاربره : ۵۰۰ هزار تومان",
            p8: "دو ماهه - سرور Unique - دو کاربره : ۷۰۰ هزار تومان",
            p9: "سه ماهه - سرور  Special تک کاربره : ۵۰۰ هزار تومان",
            p10: "سه ماهه - سرور  Special دو کاربره : ۷۰۰ هزار تومان",
            p11: "سه ماهه - سرور Unique تک کاربره : ۷۰۰ هزار تومان",
            p12: "سه ماهه - سرور Unique - دو کاربره : ۹۲۰ هزار تومان"
        },
        getKeyboardLayout: ()=>{
            return [
                [levels.plans.buttons.p1],
                [levels.plans.buttons.p2],
                [levels.plans.buttons.p3],
                [levels.plans.buttons.p4],
                [levels.plans.buttons.p5],
                [levels.plans.buttons.p6],
                [levels.plans.buttons.p7],
                [levels.plans.buttons.p8],
                [levels.plans.buttons.p9],
                [levels.plans.buttons.p10],
                [levels.plans.buttons.p11],
                [levels.plans.buttons.p12],
                [levels.general.buttons.back]
            ]
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
    }
}

module.exports = levels;