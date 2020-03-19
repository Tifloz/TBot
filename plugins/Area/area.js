exports.commands = [
    "clear"
]

exports.clear = {
    usage: "<message>",
    description: "What can you say about area ?",
    process: function (bot, msg, suffix) {
        if (!msg.channel.permissionsFor(msg.author).hasPermission("MANAGE_MESSAGES")) {
            msg.channel.send("Sorry, you don't have the permission to execute the command \"" + msg.content + "\"");
            console.log("Sorry, you don't have the permission to execute the command \"" + msg.content + "\"");
            return;
        } else if (!msg.channel.permissionsFor(bot.user).hasPermission("MANAGE_MESSAGES")) {
            msg.channel.send("Sorry, I don't have the permission to execute the command \"" + msg.content + "\"");
            console.log("Sorry, I don't have the permission to execute the command \"" + msg.content + "\"");
            return;
        }
        if (msg.channel.type == 'text') {
            msg.channel.fetchMessages()
                .then(msgs => {
                    msg.channel.bulkDelete(msgs);
                    let msgsDeleted = msgs.array().length; // number of msgs deleted

                    msg.channel.send("Deletion of msgs successful. Total msgs deleted: " + msgsDeleted);
                    console.log('Deletion of messages successful. Total msgs deleted: ' + msgsDeleted)
                })
                .catch(err => {
                    console.log('Error while doing Bulk Delete');
                    console.log(err);
                });
        }
        msg.delete(3000);
    }
}
