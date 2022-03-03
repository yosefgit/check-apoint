const fs = require('fs');
const path = require('path');
const { Console } = require('console');
const { Transform } = require('stream');
const readline = require('readline');

class Logger {

    constructor(){
        this.ts = new Transform({transform(chunk, enc, cb){cb(null, chunk)}});
        this.tableConsole = new Console({stdout: this.ts});
        this.interval = undefined;
        this.currDots = "."
    }

    async table(data){
        this.endInterval();
        this.tableConsole.table(data);
        console.table(data);
        const msg = (this.ts.read() || '').toString();
        await this.writeToFile(msg);
    }

    async log(msg){
        this.endInterval();
        console.log(msg);
        await this.writeToFile(msg);
    }

    async error(msg, save = true){
        this.endInterval();
        console.error(msg);

        if(save){
            await this.writeToFile(msg)
        }
    }

    async loadMsg(msg){
        this.writeToFile(msg);
        this.startInterval(msg);
    }

    startInterval(msg){        
        this.interval = setInterval(() => {
            this.currDots = this.currDots == "..." ? "." : this.currDots + ".";
            readline.clearLine(process.stdout,-1)
            readline.cursorTo(process.stdout,0);
            process.stdout.write("\x1B[?25l") // "\x1B[?25h" to enable curser
            process.stdout.write(`${msg}${this.currDots}`);
        },300)
    }

    endInterval(){
        if(this.interval){
            clearInterval(this.interval);
            console.log(''); // easiest way to write new line
            this.interval = undefined;
        }
    }

    async writeToFile(msg){
        const now = new Date();
        const fileName = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}.log`;
        try{
            const dir = `${__dirname}/logs`;
            await fs.promises.mkdir(dir, {recursive: true});
            const fullName = path.resolve(dir, fileName);
            await fs.promises.appendFile(fullName, msg + "\n");
        } catch(e){
            this.error(JSON.stringify(e))
        }
    }
}

module.exports = new Logger();