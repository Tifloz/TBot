const Discord = require('discord.js');

const client = new Discord.Client();

const prefix = "!";

client.login("YOUR TOKEN");

client.on("ready", () => {
    console.log("Je suis prêt !");
    client.user.setActivity("Tiflo's Bot");
});