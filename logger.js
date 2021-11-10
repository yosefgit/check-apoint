const fs = require('fs');
const path = require('path');
const { Console } = require('console');
const { Transform } = require('stream');

class Logger {

    constructor(){
        this.ts = new Transform({transform(chunk, enc, cb){cb(null, chunk)}});
        this.tableConsole = new Console({stdout: this.ts});
    }

    async table(data){
        this.tableConsole.table(data);
        console.table(data);
        const msg = (this.ts.read() || '').toString();
        await this.writeToFile(msg);
    }

    async log(msg){
        console.log(msg);
        await this.writeToFile(msg);
    }

    async error(msg, save = true){
        console.error(msg);

        if(save){
            await this.writeToFile(msg)
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