const puppeteer = require("puppeteer-extra");
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const url = "https://evisaforms.state.gov/acs/default.asp?postcode=JRS&appcode=1";
puppeteer.use(StealthPlugin())
const logger = require('./logger');
const bot = require('./checkapoint-bot');

async function check(){
    puppeteer.launch({headless: true}).then(async browser => {
        logger.log(new Date().toLocaleString())
        logger.loadMsg('checking for available appointments');

        try {
            const page = await browser.newPage()
            await page.goto(url, {waitUntil: "domcontentloaded"});
            const input = await page.waitForSelector('input');
            await input.click();
            const chkbx1 = await page.waitForSelector('input[name="chkbox01"]');
            await chkbx1.click();
            await page.click('input[name="chkservice"][value="AA"]');
            await page.click('input[type="submit"]');

            const monthsToCheck = 3;
            let openDays = 0;
            let messageTabel = {};
            
            // print available appointments for next 3 months
            for(let i = 0; i < monthsToCheck; i++){
                await page.waitForSelector('#Table3');
                const open = await page.$$('#Table3>tbody>tr>td[bgColor="#ffffc0"]');
                const booked = await page.$$('#Table3>tbody>tr>td[bgColor="#ADD9F4"]');
                let monthEl = await page.$('#Select1>option:checked');
                const month = await page.evaluate( el => el.textContent, monthEl);
                // console.log('checking for', month)
                messageTabel[month] = {open: open.length, booked: booked.length}
                openDays += open.length;

                // if open date found - send notification
                if(open.length > 0){
                    for(let date of open){
                        const day = await page.evaluate(e => e.textContent, date);
                        const msg = `open appointment found on ${month} ${day}`;
                        logger.log(msg);
                        bot.sendMessage(`${msg}\n${url}`);
                    }
                 }
                
                // find next month and click on it
                await page.waitForSelector('#Select1')
                let monthOptions = await page.$$('#Select1>option');
                for(let j = 0; j < monthOptions.length && i < monthsToCheck - 1; j++){
                    const monthOption = monthOptions[j];
                    const text = await page.evaluate(e => e.textContent, monthOption)

                    if(text == month){
                        if(month === "December"){
                            await page.waitForSelector("#Select2");
                            await page.select("#Select2", "2022"); // hardcoded to select next year.
                            await page.waitForSelector('#Select1');
                            await page.select("#Select1", "1");
                        } else {
                            await page.waitForSelector("#Select1")
                            await page.select("#Select1", (j + 2).toString())
                        }

                        break;
                    }
                }
            }

            logger.table(messageTabel);
        } catch (e){
            console.error(e);
            logger.log(e.message ? e.message : e.error ? e.error : e);
        } finally {
            await browser.close();
        }
    })
    .catch(e => console.error)
}

check()
setInterval(check, (5 * 60 * 1000))