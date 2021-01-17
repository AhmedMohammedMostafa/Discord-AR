const app = require("express").Router();
const client = require("../../index");
const { user } = require("../../index");
const checkAuth = (req, res, next) => {
    req.session.backURL = req.url || "/";
    if (req.session.user) return next();
    return res.redirect("/authorize");
};
const Badges = require("../../views/bio/Badges.js")
const db = client.db

app.get("/bio", checkAuth ,async (req, res) => {
    let haveBio = false
    let bioUsers = db.get(`user_${req.session.user.id}.isUser`);
    if(!bioUsers) {
        haveBio = false
    } else {
        haveBio = true
    }
    let all = [];
    client.db.all().filter(data => data.ID.startsWith("user_")).forEach(b => all.push(client.db.get(b.ID)));



    let featured = [];
    client.db.all().filter(data => data.ID.startsWith("user_")).forEach(b => featured.push(client.db.get(b.ID)));
    featured = featured.filter(data => client.booster.has(data.id));

res.render("bio/index", {
    user: req.session.user,
    bot: client,
    haveBio,
    all: all.sort((a, b) => b.likes - a.likes).slice(0,8),
    featured
})
})

app.post("/check-image", checkAuth, async (req, res) => {
    
    if(!req.body.banner) {
        return res.json({ error: 'No Image Link Provided'})
    } 
    
    if(isImageUrl(req.body.banner)) {
        res.json({ isImage: true})
    } else {
        res.json({ isImage: false})
    }
    });
    
    
    
    app.get("/logout", (req, res) => {
        return res.redirect("/authorize/logout");
    });
    
    app.get("/p/:id", checkAuth, async (req, res) => {
       
        let id = req.params.id;
        let user = client.users.cache.get(id)
        if (!id || !client.users.cache.get(id) || client.users.cache.get(id).bot) return res.redirect("/");
        let haveBio = false
        let bioUsers = db.get(`user_${req.session.user.id}.isUser`);
        if(!bioUsers) {
            haveBio = false
        } else {
            haveBio = true
        }

if(!db.get(`user_${user.id}.isUser`)) return res.redirect("/")

    let bannerURL = db.get(`user_${user.id}.bannerURL`);
    
        if (req.session.user && req.session.user.id == id) return res.redirect("/me");
        let bots = [];
        client.db.all().filter(bot => bot.ID.startsWith("bot_")).forEach(d => bots.push(client.db.get(d.ID)));
        bots = bots.filter(d => d.owner.id === id && !!d.approved);
        if (!user.flags) await user.fetchFlags();
        const Flags = user.flags.toArray();
        const flags = Flags.filter(b => !!Badges[b]).map(m => Badges[m]);
        if(checkNitro(req,res)) flags.push(Badges["DISCORD_NITRO"]);
        let status = client.users.cache.get(id).presence.activities

         let customStatus = false 
 if(status.filter(s => s.type == "CUSTOM_STATUS")) {
    customStatus = status[0]
 } 
        res.render("user", {
            user: req.session.user,
            bot: client,
            bots: bots.length < 1 ? null : bots,
            mem: client.users.cache.get(id),
            arb: true,
            flags: flags,
            haveBio,
            bannerURL,
            status,
            customStatus
        });
    });
    
    app.get("/me", checkAuth, async (req, res) => {
        let bots = [];
        client.db.all().filter(bot => bot.ID.startsWith("bot_")).forEach(d => bots.push(client.db.get(d.ID)));
        bots = bots.filter(d => d.owner.id === req.session.user.id);
    const user =  client.users.cache.get(req.session.user.id);
    if(!user) return res.redirect("/me/create")
    if (!user.flags) await user.fetchFlags();
    const Flags = user.flags.toArray();
    const flags = Flags.filter(b => !!Badges[b]).map(m => Badges[m]);
    if(checkNitro(req,res)) flags.push(Badges["DISCORD_NITRO"]);
    let status = client.users.cache.get(req.session.user.id).presence.activities

     let customStatus = false 
if(status.filter(s => s.type == "CUSTOM_STATUS")) {
customStatus = status[0]
} 
        let haveBio = false
        let bioUsers = db.get(`user_${req.session.user.id}.isUser`);
        if(!bioUsers) {
            haveBio = false
        } else {
            haveBio = true
        }

        if(!bioUsers) return res.redirect("/me/create");
    let bannerURL = db.get(`user_${user.id}.bannerURL`);


        res.render("me/me", {
            user: user,
            bot: client,
            bots: bots.length < 1 ? null : bots,
            arb: false,
            flags,
            haveBio,
            bannerURL,
            status,
            customStatus
        });
    });
    
    app.get("/me/edit", checkAuth, async (req, res) => {
        if (!req.session.user.isMember) return res.redirect("/")
        const user =  client.users.cache.get(req.session.user.id);
        if (!user.flags) await user.fetchFlags();
        const Flags = user.flags.toArray();
        const flags = Flags.filter(b => !!Badges[b]).map(m => Badges[m]);
        if(checkNitro(req,res)) flags.push(Badges["DISCORD_NITRO"]);
        let status = client.users.cache.get(req.session.user.id).presence.activities
    
         let customStatus = false 
    if(status.filter(s => s.type == "CUSTOM_STATUS")) {
    customStatus = status[0]
    } 
    let haveBio = false
    let bioUsers = db.get(`user_${req.session.user.id}.isUser`);
    if(!bioUsers) {
        haveBio = false
    } else {
        haveBio = true
    }

    if(!bioUsers) return res.redirect("/me/create");
    let bannerURL = db.get(`user_${user.id}.bannerURL`);
        res.render("me/edit", {
            user: user,
            bot: client,
            flags: flags,
            haveBio,
            bannerURL,
            status,
            customStatus
        });
    });
    
    app.get("/me/create", checkAuth, async (req, res) => {
        if (!req.session.user.isMember) return res.redirect("/")
        let user = client.users.cache.get(req.session.user.id);
    if(!user) return res.redirect("/server")
        let haveBio = false
        let bioUsers = db.get(`user_${req.session.user.id}.isUser`);
        if(!bioUsers) {
            haveBio = false
        } else {
            haveBio = true
        }

    let bannerURL = db.get(`user_${user.id}.bannerURL`);
    
      
        if (!user.flags) await user.fetchFlags();
        const Flags = user.flags.toArray();
        const flags = Flags.filter(b => !!Badges[b]).map(m => Badges[m]);
        if(checkNitro(req,res)) flags.push(Badges["DISCORD_NITRO"]);
        let status = client.users.cache.get(req.session.user.id).presence.activities

         let customStatus = false 
 if(status.filter(s => s.type == "CUSTOM_STATUS")) {
    customStatus = status[0]
 } 
        res.render("me/create", {
            user: user,
            bot: client,
            haveBio,
            flags: flags,
            bannerURL,
            status,
            customStatus
        });
    });
    
    app.post("/checklike", checkAuth, async (req, res) => {
        if(!req.body.user) {
            return res.json({ status : 404});
        }

        let liked = db.fetch(`liked_${req.session.user.id}_${req.body.user}`);
        if(liked) {
return res.json({ checked: true})
        } else {
            return res.json({ checked: false})
        }
    })

    app.post("/like", checkAuth, async (req, res) => {
        if(!req.body.user) {
            return res.json({ status : 404});
        }

        let liked = db.fetch(`liked_${req.session.user.id}_${req.body.user}`);
        if(liked) {
db.delete(`liked_${req.session.user.id}_${req.body.user}`)
db.subtract(`user_${req.body.user}.likes`, 1)
let likes = db.fetch(`user_${req.body.user}.likes`);
return res.json({ checked: false, likes: likes})
        } else {
            db.set(`liked_${req.session.user.id}_${req.body.user}`, true)
            db.add(`user_${req.body.user}.likes`, 1)
            let likes = db.fetch(`user_${req.body.user}.likes`);

            return res.json({ checked: true, likes: likes})
        }
    })

    app.post("/edit", checkAuth, async (req, res) => {
        console.log('Edit')
        db.set(`user_${req.session.user.id}.bio`, req.body.about)
        db.set(`user_${req.session.user.id}.location`, req.body.location)
        db.set(`user_${req.session.user.id}.email`, req.body.email)
        db.set(`user_${req.session.user.id}.job`, req.body.job)
        db.set(`user_${req.session.user.id}.gender`, req.body.gender)

        return res.json({ status: 200});
    });
    
    app.post("/create", checkAuth, async (req, res) => {
        if(!req.session.user) return res.redirect("/server")
        db.set(`user_${req.session.user.id}.bio`, req.body.about)
        db.set(`user_${req.session.user.id}.location`, req.body.location)
        db.set(`user_${req.session.user.id}.email`, req.body.email)
        db.set(`user_${req.session.user.id}.job`, req.body.job)
        db.set(`user_${req.session.user.id}.gender`, req.body.gender)
db.set(`user_${req.session.user.id}.isUser`, true)
db.set(`user_${req.session.user.id}.id`, req.session.user.id)
return res.json({ status: 200});

    });

const fetch = require("node-fetch");

async function checkNitro(req,res) {
     fetch(`https://discord.com/api/users/@me`, { 
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${req.session.user.access_token}`,
        'Content-Type': 'application/json' 
}
}).then(async response => {
    let check = await response.json()
    if(check.premium_type != 0) {
        return true;
    }
    
})

}

module.exports = app;