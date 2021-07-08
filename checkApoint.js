const Webdriver = require('selenium-webdriver');
const FireFox = require('selenium-webdriver/firefox');
const bot = require('./checkapoint-bot');

const Builder = Webdriver.Builder;
const By = Webdriver.By;
const log = console.log;
const url = "https://evisaforms.state.gov/acs/default.asp?postcode=JRS&appcode=1";

// start headless browser instance
const driver = new Builder().forBrowser('firefox').setFirefoxOptions(new FireFox.Options().headless()).build();

const checkForAppointments = async () => {
   log(new Date().toLocaleString())
   log('checking for available appointments...');

   
   try {
      await driver.get(url);
   } catch (error) {
      console.error("couldn't connect to embassy website, skipping check");
      return;
   }

   try{
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
      let messageTabel = {};

      // print available appointments for next 3 months
      for(let i = 0; i < monthsToCheck; i++){
         const open = await driver.findElements(By.css('#Table3>tbody>tr>td[bgColor="#ffffc0"]'));
         const booked = await driver.findElements(By.css('#Table3>tbody>tr>td[bgColor="#ADD9F4"]'));
         let monthEl = await driver.findElement(By.css('#Select1>option:checked'));
         let month = await monthEl.getText();
         
         messageTabel[month] = {open: open.length, booked: booked.length}
         openDays += open.length;

         if(open.length > 0){
            open.forEach((async openDate => {
               const date = await openDate.getText();
               const msg = `open appointment found on ${month} ${date}`;

               log(msg);
               bot.sendMessage(`${msg}\n${url}`);
            }).bind(this))
         }

         if(i === (monthsToCheck - 1)){
            break;
         }

         const optionsEl = await driver.findElements(By.css('#Select1>option'));

         // find next month and click on it
         for(let i = 0; i < optionsEl.length; i++){
            const text = await optionsEl[i].getText();

            if(text == month){
               await optionsEl[i + 1].click();

               break;
            }
         }
      }

      console.table(messageTabel);

      if(openDays > 0){
         // notify
         log('open day found')
         bot.sendMessage("open appointment found\n" + url)
      }

      // close session
      // await driver.quit();
   } catch (e){
      console.error(e);
      // await driver.quit()
   }
}

checkForAppointments()
setInterval(checkForAppointments, (5 * 60 * 1000))