const fs = require('fs');

process.on('unhandledRejection', (reason) => {
    console.error(reason);
    process.exit(1);
});

try {
    var Discord = require("discord.js");
} catch (e) {
    console.log(e.stack);
    console.log(process.version);
    console.log("Please run npm install and ensure it passes with no errors!");
    process.exit();
}
console.log("Starting DiscordBot\nNode version: " + process.version + "\nDiscord.js version: " + Discord.version);

try {
    var AuthDetails = require("./auth.json");
} catch (e) {
    console.log("Please create an auth.json like auth.json.example with a bot token or an email and password.\n" + e.stack);
    process.exit();
}

var Config = {};
try {
    Config = require("./config.json");
} catch (e) {
    Config.debug = false;
    Config.commandPrefix = '!';
    try {
        if (fs.lstatSync("./config.json").isFile()) {
            console.log("WARNING: config.json found but we couldn't read it!\n" + e.stack);
        }
    } catch (e2) {
        fs.writeFile("./config.json", JSON.stringify(Config, null, 2), (err) => {
            if (err) console.error(err);
        });
    }
}
if (!Config.hasOwnProperty("commandPrefix")) {
    Config.commandPrefix = '!'; // set bots prefix
}

const bot = new Discord.Client();


bot.login(AuthDetails.bot_token);

bot.on("ready", () => {
    console.log("Je suis prêt !");
    bot.user.setActivity("Tiflo's Bot");
});
bot.on('message', msg => {
    if (msg.content === 'ping') {
        msg.reply('pong');
    }
});

bot.on("disconnected", function () {
    console.log("Disconnected!");
    process.exit(1);
});