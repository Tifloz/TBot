const Discord = require("discord.js");
require('dotenv').config();
const prefix = "!";

const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]});
client.once('ready', () => {
    console.log('Keyhole Discord App online');
})

client.on("messageCreate", function(message) {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    if (command === "ping") {
        const timeTaken = Date.now() - message.createdTimestamp;
        message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
    }
});

client.login(process.env.DISCORD_TOKEN).then(r => console.log("Connected to servers"));