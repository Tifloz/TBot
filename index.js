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

const dangerousCommands = ["eval", "pullanddeploy", "setUsername", "cmdauth"];
var Permissions = {};
try {
    Permissions = require("./permissions.json");
} catch (e) {
    Permissions.global = {};
    Permissions.users = {};
}

for (var i = 0; i < dangerousCommands.length; i++) {
    var cmd = dangerousCommands[i];
    if (!Permissions.global.hasOwnProperty(cmd)) {
        Permissions.global[cmd] = false;
    }
}
Permissions.checkPermission = function (userid, permission) {
    try {
        var allowed = true;
        try {
            if (Permissions.global.hasOwnProperty(permission)) {
                allowed = Permissions.global[permission] === true;
            }
        } catch (e) {
        }
        try {
            if (Permissions.users[userid].hasOwnProperty("*")) {
                allowed = Permissions.users[userid]["*"] === true;
            }
            if (Permissions.users[userid].hasOwnProperty(permission)) {
                allowed = Permissions.users[userid][permission] === true;
            }
        } catch (e) {
        }
        return allowed;
    } catch (e) {
    }
    return false;
};
fs.writeFile("./permissions.json", JSON.stringify(Permissions, null, 2), (err) => {
    if (err) console.error(err);
});


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
    Config.commandPrefix = '!';
}


commands = {
    "ping": {
        description: "Responds pong; useful for checking if bot is alive.",
        process: function (bot, msg, suffix) {
            msg.channel.send(msg.author + " pong!");
            if (suffix) {
                msg.channel.send("Note that !ping takes no arguments!");
            }
        }
    },
    "idle": {
        usage: "[status]",
        description: "Sets bot status to idle.",
        process: function (bot, msg, suffix) {
            bot.user.setStatus("idle").then(console.log).catch(console.error);
        }
    },
    "online": {
        usage: "[status]",
        description: "Sets bot status to online.",
        process: function (bot, msg, suffix) {
            bot.user.setStatus("online").then(console.log).catch(console.error);
        }
    },
    "say": {
        usage: "<message>",
        description: "Bot sends message",
        process: function (bot, msg, suffix) {
            msg.channel.send(suffix);
        }
    },
    "announce": {
        usage: "<message>",
        description: "Bot sends message in text to speech.",
        process: function (bot, msg, suffix) {
            msg.channel.send(suffix, {tts: true});
        }
    },
    "msg": {
        usage: "<user> <message to send user>",
        description: "Sends a message to a user the next time they come online.",
        process: function (bot, msg, suffix) {
            var args = suffix.split(' ');
            var user = args.shift();
            var message = args.join(' ');
            if (user.startsWith('<@')) {
                user = user.substr(2, user.length - 3);
            }
            var target = msg.channel.guild.members.find("id", user);
            if (!target) {
                target = msg.channel.guild.members.find("username", user);
            }
            messagebox[target.id] = {
                channel: msg.channel.id,
                content: target + ", " + msg.author + " said: " + message
            };
            updateMessagebox();
            msg.channel.send("Message saved.")
        }
    },
    "eval": {
        usage: "<command>",
        description: 'Executes arbitrary javascript in the bot process. User must have "eval" permission.',
        process: function (bot, msg, suffix) {
            let result = eval(suffix, bot).toString();
            if (result) {
                msg.channel.send(result);
            }
        }
    },
    "cmdauth": {
        usage: "<userid> <get/toggle> <command>",
        description: "Gets/toggles command usage permissions for the specified user.",
        process: function (bot, msg, suffix) {
            var Permissions = require("./permissions.json");
            var fs = require('fs');

            var args = suffix.split(' ');
            var userid = args.shift();
            var action = args.shift();
            var cmd = args.shift();

            if (userid.startsWith('<@')) {
                userid = userid.substr(2, userid.length - 3);
            }

            var target = msg.channel.guild.members.find("id", userid);
            if (!target) {
                msg.channel.send("Could not find user.");
            } else {
                if (commands[cmd] || cmd === "*") {
                    var canUse = Permissions.checkPermission(userid, cmd);
                    var strResult;
                    if (cmd === "*") {
                        strResult = "All commands"
                    } else {
                        strResult = 'Command "' + cmd + '"';
                    }
                    if (action.toUpperCase() === "GET") {
                        msg.channel.send("User permissions for " + strResult + " are " + canUse);
                    } else if (action.toUpperCase() === "TOGGLE") {
                        if (Permissions.users.hasOwnProperty(userid)) {
                            Permissions.users[userid][cmd] = !canUse;
                        } else {
                            Permissions.users[userid].append({[cmd]: !canUse});
                        }
                        fs.writeFile("./permissions.json", JSON.stringify(Permissions, null, 2));

                        msg.channel.send("User permission for " + strResult + " set to " + Permissions.users[userid][cmd]);
                    } else {
                        msg.channel.send('Requires "get" or "toggle" parameter.');
                    }
                } else {
                    msg.channel.send("Invalid command.")
                }
            }
        }
    }
};


if (AuthDetails.hasOwnProperty("client_id")) {
    commands["invite"] = {
        description: "Generates an invite link you can use to invite the bot to your server.",
        process: function (bot, msg, suffix) {
            msg.channel.send("Invite link: https://discordapp.com/oauth2/authorize?&client_id=" + AuthDetails.client_id + "&scope=bot&permissions=470019135");
        }
    }
}
var hooks = {
    onMessage: []
};

const bot = new Discord.Client();

bot.on("ready", function () {
    console.log("Logged in! Currently serving " + bot.guilds.array().length + " servers.");
    console.log("Type " + Config.commandPrefix + "help on Discord for a command list.");
    bot.user.setPresence({
        game: {
            name: Config.commandPrefix + "help | " + bot.guilds.array().length + " Servers"
        }
    });
});

function checkMessageForCommand(msg, isEdit) {
    if(msg.author.id != bot.user.id && (msg.content.startsWith(Config.commandPrefix))){
        console.log("treating " + msg.content + " from " + msg.author + " as command");
        var cmdTxt = msg.content.split(" ")[0].substring(Config.commandPrefix.length);
        var suffix = msg.content.substring(cmdTxt.length+Config.commandPrefix.length+1);
        if(msg.isMentioned(bot.user)){
            try {
                cmdTxt = msg.content.split(" ")[1];
                suffix = msg.content.substring(bot.user.mention().length+cmdTxt.length+Config.commandPrefix.length+1);
            } catch(e){
                return false;
            }
        }
        var cmd = commands[cmdTxt];
        if(cmdTxt === "help"){
            if(suffix){
                var cmds = suffix.split(" ").filter(function(cmd){return commands[cmd]});
                var info = "";
                for(var i=0;i<cmds.length;i++) {
                    var cmd = cmds[i];
                    info += "**"+Config.commandPrefix + cmd+"**";
                    var usage = commands[cmd].usage;
                    if(usage){
                        info += " " + usage;
                    }
                    var description = commands[cmd].description;
                    if(description instanceof Function){
                        description = description();
                    }
                    if(description){
                        info += "\n\t" + description;
                    }
                    info += "\n"
                }
                msg.channel.send(info);
            } else {
                msg.author.send("**Available Commands:**").then(function(){
                    var batch = "";
                    var sortedCommands = Object.keys(commands).sort();
                    for(var i in sortedCommands) {
                        var cmd = sortedCommands[i];
                        var info = "**"+Config.commandPrefix + cmd+"**";
                        var usage = commands[cmd].usage;
                        if(usage){
                            info += " " + usage;
                        }
                        var description = commands[cmd].description;
                        if(description instanceof Function){
                            description = description();
                        }
                        if(description){
                            info += "\n\t" + description;
                        }
                        var newBatch = batch + "\n" + info;
                        if(newBatch.length > (1024 - 8)){
                            msg.author.send(batch);
                            batch = info;
                        } else {
                            batch = newBatch
                        }
                    }
                    if(batch.length > 0){
                        msg.author.send(batch);
                    }
                });
            }
            return true;
        }
        else if(cmd) {
            if(Permissions.checkPermission(msg.author.id,cmdTxt)){
                try{
                    cmd.process(bot,msg,suffix,isEdit);
                } catch(e){
                    var msgTxt = "command " + cmdTxt + " failed :(";
                    if(Config.debug){
                        msgTxt += "\n" + e.stack;
                        console.log(msgTxt);
                    }
                    if(msgTxt.length > (1024 - 8)){
                        msgTxt = msgTxt.substr(0,1024-8);
                    }
                    msg.channel.send(msgTxt);
                }
            } else {
                msg.channel.send("You are not allowed to run " + cmdTxt + "!");
            }
            return true;
        } else {
            msg.channel.send(cmdTxt + " is not not recognized as a command!").then((message => message.delete(5000)))
            return true;
        }
    } else {
        if(msg.author == bot.user){
            return true;
        }

        if (msg.author != bot.user && msg.isMentioned(bot.user)) {
        } else {

        }
        return false;
    }
}

bot.on("message", (msg) => {
    if(!checkMessageForCommand(msg, false)){
        for(msgListener of hooks.onMessage){
            msgListener(msg);
        }
    }
});
bot.on("messageUpdate", (oldMessage, newMessage) => {
    checkMessageForCommand(newMessage,true);
});


bot.on("disconnected", function () {
    console.log("Disconnected!");
    process.exit(1);
});

if(AuthDetails.bot_token){
    console.log("logging in with token");
    bot.login(AuthDetails.bot_token);
} else {
    console.log("Logging in with user credentials is no longer supported!\nYou can use token based log in with a user account; see\nhttps://discord.js.org/#/docs/main/master/general/updating.");
}