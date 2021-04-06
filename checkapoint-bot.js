const TelegramBot = require('node-telegram-bot-api');

const token = '1743633443:AAEJXnDBqiF-XrzdfD36015_GET1-35PBFI';
// const chatId = 1579067842;
const groupId = "-436926629";

const bot = new TelegramBot(token, {polling: true});

bot.on("message", (msg) => {
        const chatId = msg.chat.id;
        
        console.log("chatId:", chatId);
        
        bot.sendMessage(chatId, 'test');
})

function sendMessage(msg){
        bot.sendMessage(groupId, msg)
}

function timeout(){
        setTimeout(() => timeout(), 10000)
}

timeout()

module.exports.sendMessage = sendMessage;