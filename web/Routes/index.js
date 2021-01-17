const app = require("express").Router();
const client = require("../../index");
const { user } = require("../../index");
const checkAuth = (req, res, next) => {
    req.session.backURL = req.url || "/";
    if (req.session.user) return next();
    return res.redirect("/authorize");
};

const db = client.db

app.get("/", checkAuth,async (req, res) => {
    let bots = [];
    client.db.all().filter(data => data.ID.startsWith("bot_")).forEach(b => bots.push(client.db.get(b.ID)));
    if(!req.session.user) return res.redirect("/login")
    let haveBio = false
    let bioUsers = db.get(`user_${req.session.user.id}.isUser`);
    if(!bioUsers) {
        haveBio = false
    } else {
        haveBio = true
    }


    res.render("index", {
        user: req.session.user,
        bot: client,
        botl: bots.length || `0`,
        haveBio: haveBio
    });
});

app.get("/login", (req, res) => {
    return res.redirect("/authorize");

});
const isImageUrl = require('is-image-url');


module.exports = app;