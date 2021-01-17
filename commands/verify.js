const discord = require("discord.js");
const { db } = require("..");

module.exports.run = (client, message, args) => {
    if (!message.member.hasPermission("MANAGE_GUILD")) return;
    let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
   
    if(!user) return;

    let verified = client.db.get(`verified_${user.id}`);

    if(verified) {
        client.db.delete(`verified_${user.id}`)
    }

    client.db.set(`verified_${user.id}`, true)

    message.channel.send('Done')
}

module.exports.help = {
    name: "verify",
    aliases: []
}