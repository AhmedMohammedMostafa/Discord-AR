require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client({
    fetchAllMembers: true,
    disableMentions: "everyone"
});
client.config = require("./config");
client.commands = new Discord.Collection();
client.db = require("quick.db");
client.cmdmap = new Map();
client.on("ready", async () => {
    client.db.set("destroyed", false);
    console.log("Bot is Online!");
    client.user.setActivity({
        name: "Discord AR",
        type: "LISTENING"
    });
    require("./loader")(client);
    client.mainGuild = client.guilds.cache.get(client.config.guilds.main);
    client.testGuild = client.guilds.cache.get(client.config.guilds.testing);
    client.owner = client.guilds.cache.get(client.config.guilds.main).owner;
    client.admins = client.guilds.cache.get(client.config.guilds.main).members.cache.filter(m => !m.user.bot && m.hasPermission("ADMINISTRATOR"));
    client.mods = client.guilds.cache.get(client.config.guilds.main).members.cache.filter(m => !m.user.bot && !m.hasPermission("ADMINISTRATOR"));
    client.booster = client.guilds.cache.get(client.config.guilds.main).members.cache.filter(m => m.roles.cache.has("766759696714432558"));
    client.verified = client.db.get('verified');
    if(!client.verified) {
      client.verified = []
  }
    setInterval(() => {
        client.syncDatabase();
    }, 1.8e+6);
});

function log(data, ...message) {
    let wh = new Discord.WebhookClient("01234567890123456789", "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
    return wh.send(...message, data).catch(e => {
        client.channels.cache.get(client.config.channels.log).send(...message);
    });
}

client.on("botAdd", data => {
    log({ username: data.username, avatarURL: data.avatarURL }, `<@${data.owner.id}> added a bot <@${data.id}> [${data.username}]\n<${client.config.website.redirectURI.split("/authorize")[0]}/bot/${data.id}>`);
});

client.on("edit", data => {
    log({ username: data.username, avatarURL: data.avatarURL }, `<@${data.exc.id}> edited a bot <@${data.id}> [${data.username}]\n<${client.config.website.redirectURI.split("/authorize")[0]}/bot/${data.id}>`);
});

client.on("vote", data => {
    log({ username: data.username, avatarURL: data.avatarURL }, `<@${data.exc.id}> voted a bot <@${data.id}> [${data.username}]\n<${client.config.website.redirectURI.split("/authorize")[0]}/bot/${data.id}/vote>`);
});

client.on("delete", data => {
    if (client.mainGuild.members.cache.get(data.id)) client.mainGuild.members.cache.get(data.id).kick(data.reason ? data.reason : "Owner deleted!").catch(e => {});
    log({ username: data.username, avatarURL: data.avatarURL }, `Bot <@${data.id}> [${data.username}] by <@${data.owner.id}> was deleted by <@${data.exc.id}>.${data.reason ? ` Reason: ${data.reason}` : ""}`);
});

client.on("approve", data => {
    log({ username: data.username, avatarURL: data.avatarURL }, `Bot <@${data.id}> [${data.username}] by <@${data.owner.id}> was approved by <@${data.exc.id}>\n<${client.config.website.redirectURI.split("/authorize")[0]}/bot/${data.id}>`);
    client.mainGuild.members.cache.get(data.owner.id).roles.add(client.config.roles.developer);
});

client.on("guildMemberAdd", (member) => {
    if (member.guild.id == client.mainGuild.id) {
        if (member.user.bot && (client.db.get(`bot_${member.id}`) !== null && !!client.db.get(`bot_${member.id}`).approved)) {
            member.roles.add(client.config.roles.bots).catch(e => {});
        }
    }
    if (member.guild.id === client.testGuild.id) {
        if (member.user.bot && client.db.get(`bot_${member.id}`) !== null && !client.db.get(`bot_${member.id}`).verified && !client.db.get(`bot_${member.id}`).approved) {
            client.db.set(`bot_${member.id}.verified`, true);
            if (!client.db.set(`bot_${member.id}.verified`, true)) log({ username: member.user.username, avatarURL: member.user.displayAvatarURL() },`Bot <@${member.id}> [${member.user.username}] by <@${client.db.get(`bot_${member.id}`).owner.id}> has been added to the verification server!`);
        }
    }
});

client.on("guildMemberRemove", member => {
    let botsof = [];
    if (member.guild.id == client.mainGuild.id) {
        if (member.user.bot && client.db.get(`bot_${member.id}`) !== null) {
            let bot = client.db.get(`bot_${member.id}`);
            client.db.delete(`bot_${member.id}`);
            let data = {
                exc: client.user,
                reason: "Bot left the server.",
                owner: bot.owner,
                id: member.id,
                username: member.user.username
            };
            client.emit("delete", data);
            if (client.db.get(`user_${member.id}`) !== null) {
                client.db.delete(`user_${member.id}`);
            }
        }
            
        if (!member.user.bot) {
            client.db.all().filter(d => d.ID.startsWith("bot_")).forEach(i => botsof.push(client.db.get(i.ID)));
            botsof = botsof.filter(i => i.owner.id === member.user.id);
            if (botsof.length < 1) return;
            botsof.forEach(b => {
                let data = {
                    exc: client.user,
                    reason: "Owner left the server.",
                    owner: b.owner,
                    id: b.id,
                    username: b.username
                };
                client.emit("delete", data);
            });
        }
    }
});

client.on("decline", data => {
    const embed = new Discord.MessageEmbed()
        .setTitle("Bot Declined!")
        .setThumbnail(data.avatarURL)
        .addField("Bot", `<@${data.id}> [${data.username}]`, true)
        .addField("Moderator", `<@${data.exc.id}>`, true)
        .addField("Reason", data.reason || "No reason provided!", false)
        .setFooter("Discord AR", client.user.avatarURL())
        .setTimestamp();

    log({ username: data.username, avatarURL: data.avatarURL }, `Bot <@${data.id}> [${data.username}] by <@${data.owner.id}> was declined!`, embed);
});



client.on("message", async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith("-")) return;
    let args = message.content.slice(1).trim().split(/ +/g);
    let cmd = args.shift().toLowerCase();
    if (!client.commands.get(cmd)) return;
    client.commands.get(cmd).run(client, message, args);
});




client.login(client.config.TOKEN);

module.exports = client;

Array.prototype.shuffle = function () {
    for (let i = this.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this[i], this[j]] = [this[j], this[i]];
    }
    return this;
};



setInterval(function () { 
    let guild = client.guilds.cache.get('766748088018141214');
    client.booster = guild.members.cache.filter(member => member.roles.cache.get(client.config.roles.booster) || member.roles.cache.get(client.config.roles.premium))
}, 10000)

