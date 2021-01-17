const discord = require("discord.js");

module.exports.run = (client, message, args) => {
    if (!message.member.hasPermission("MANAGE_GUILD")) return;
    let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
   
    if(!user) return;

    let verified = client.db.get(`boosted_${user.id}`);

    if(verified) {
        client.db.delete(`boosted_${user.id}`)
    }

    client.db.set(`boosted_${user.id}`, true)

    message.channel.send('Done')
}

module.exports.help = {
    name: "premium",
    aliases: []
}