const Discord = require("discord.js");
module.exports.run = (client, message, args) => {
if(!client.booster.has(message.author.id)) {
  return message.channel.send('Your Not Premium!')
}
if(!message.attachments.first()) {
  return message.channel.send('Please Upload A Banner!')
}

let isUser = client.db.fetch(`user_${message.author.id}.isUser`);
if(!isUser) return message.channel.send('Please Create A Profile First')

client.db.set(`user_${message.author.id}.bannerURL`, message.attachments.first().url)

message.channel.send('Done. Added Banner')
}




module.exports.help = {
    name:  "banner",
    aliases: []
}