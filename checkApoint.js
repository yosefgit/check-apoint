const Webdriver = require('selenium-webdriver');
const FireFox = require('selenium-webdriver/firefox');
const bot = require('./checkapoint-bot');

const Builder = Webdriver.Builder;
const By = Webdriver.By;
const log = console.log;
const url = "https://evisaforms.state.gov/acs/default.asp?postcode=JRS&appcode=1";
const argsTypes = {
   alwaysNotify: "--n"
}

const alwaysNotify = process.argv.some(arg => arg === argsTypes.alwaysNotify);

if(alwaysNotify){
   log("notify user after every scan - enabled");
}

const checkForAppointments = async () => {
   log('checking for available appointments...');
   
   try{
      const driver = new Builder().forBrowser('firefox').setFirefoxOptions(new FireFox.Options().headless()).build();
      const results = []
      await driver.get(url);
      await driver.findElement(By.css('input')).click();
      const chkbx1 = await driver.findElement(By.css('input[name="chkbox01"]'))
      chkbx1.click();
      const chkbx2 = await driver.findElement(By.css('input[name="chkservice"][value="02B"]'))
      chkbx2.click();
      const chkbx3 = await driver.findElement(By.css('input[name="chkservice"][value="07B"]'));
      chkbx3.click();
      const submit = await driver.findElement(By.css('input[type="submit"]'))
      submit.click();
      
      const monthsToCheck = 3;
      let openDays = 0;

      // print available appointments for next 3 months
      for(let i = 0; i < monthsToCheck; i++){
         const open = await driver.findElements(By.css('#Table3>tbody>tr>td[bgColor="#ffffc0"]'));
         const booked = await driver.findElements(By.css('#Table3>tbody>tr>td[bgColor="#ADD9F4"]'));
         let monthEl = await driver.findElement(By.css('#Select1>option:checked'));
         let month = await monthEl.getText();
         
         const message = `${month} ${open.length} available appointments ${booked.length} booked appointments`;

         log(message);
         results.push(message)
         openDays += open.length;
         
         const optionsEl = await driver.findElements(By.css('#Select1>option'));

         if(open.length > 0){
            open.forEach((async openDate => {
               const date = await openDate.getText();
               const currURl = await driver.getCurrentUrl();
               const msg = `open appointment found on ${month} ${date}`;
               log(msg);
               bot.sendMessage(`${msg} \nlink: ${currURl}`)
            }))
         }

         if(i === (monthsToCheck - 1)){
            break;
         }

         // find next month and click on it
         for(let i = 0; i < optionsEl.length; i++){
            const text = await optionsEl[i].getText();

            if(text == month){
               await optionsEl[i + 1].click();

               break;
            }
         }
      }

      if(openDays > 0){
         // notify
         log('open day found')
         const currUrl = await driver.getCurrentUrl();
         bot.sendMessage("open appointment found\n" + currUrl)
      }

      // close session
      await driver.quit();
      alwaysNotify && bot.sendMessage(new Date(Date.now()).toLocaleString() + '\n' + results.join('\n'));
   } catch (e){
      console.error(e);
      await driver.quit()
   }
}

checkForAppointments()
setInterval(checkForAppointments, (10 * 60 * 1000))

