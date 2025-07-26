import { injectCode, injectCodes } from "./utils.js";

var building_engine = {};
var achiev_engine = {};
achiev_engine.achievementQueue = [];
achiev_engine.replaceQueue = [];
achiev_engine.batch = '';
achiev_engine.batches = {};

achiev_engine.setBatch = function (batch) {
    this.batch = batch;
    this.batches[batch] = [];
    en.newVar(batch, "string");
}

achiev_engine.addAchievement = function (name, desc, icon, prev, other) {
    this.achievementQueue.push({
        name: name,
        desc: desc,
        icon: icon,
        prev: prev,
        batch: achiev_engine.batch,
        other: other
    })
}

var upgrade_engine = {};
upgrade_engine.flavored_engine = {};
upgrade_engine.hupgrade_engine = {};

upgrade_engine.replaceQueue = [];
upgrade_engine.upgradeQueue = [];
upgrade_engine.batch = '';
upgrade_engine.batches = {};

upgrade_engine.setBatch = function (batch) {
    this.batch = batch;
    this.batches[batch] = [];
    en.newVar(batch, "string");
}

upgrade_engine.addUpgrade = function (name, desc, price, icon, order, other) {
    this.upgradeQueue.push({
        name: name,
        desc: desc,
        price: price,
        icon: icon,
        order: order,
        batch: upgrade_engine.batch,
        other: other
    })
}


upgrade_engine.replaceDesc = function (upgrade, newDesc) {
    this.replaceQueue.push({
        upgrade: upgrade,
        newDesc: newDesc
    })
}

upgrade_engine.appendToDesc = function (upgrade, newDesc) {
    var position = upgrade.ddesc.indexOf("<q>");
    this.replaceDesc(upgrade, [upgrade.ddesc.slice(0, position), " " + newDesc, upgrade.ddesc.slice(position)].join(''));
}

upgrade_engine.replaceDescPart = function (upgrade, newDesc) {
    this.replaceDesc(upgrade, [newDesc, "<q>" + upgrade.ddesc.split("<q>")[1]].join(''));
}

upgrade_engine.strReplace = function (upgrade, find, replace) {
    this.replaceDesc(upgrade, upgrade.ddesc.replace(find, replace));
}

achiev_engine.replaceDesc = function (achiev, newDesc) {
    this.replaceQueue.push({
        achiev: achiev,
        newDesc: newDesc
    })
}

achiev_engine.appendToDesc = function (achiev, newDesc) {
    var position = achiev.ddesc.indexOf("<q>");
    this.replaceDesc(achiev, [achiev.ddesc.slice(0, position), " " + newDesc, achiev.ddesc.slice(position)].join(''));
}

achiev_engine.replaceDescPart = function (achiev, newDesc) {
    this.replaceDesc(achiev, [newDesc, "<q>" + achiev.ddesc.split("<q>")[1]].join(''));
}

achiev_engine.strReplace = function (achiev, find, replace) {
    this.replaceDesc(achiev, achiev.ddesc.replace(find, replace));
}

upgrade_engine.saveUpgrades = function() {
    var toCompress = [];
    for (var i in this.batches) {
        toCompress = [];
        this.batches[i].forEach((name) => {
            let me = Game.Upgrades[name];
            toCompress.push(Math.min(me.unlocked, 1), Math.min(me.bought, 1));
        });
        en.setVar(i, toCompress.join('^'));
    }
}

upgrade_engine.loadUpgrades = function() {
    let spl = [];
    for (var i in this.batches) {
        spl = en.getVar(i).split('^');
        if ((spl.length % 2 == 0) && (spl.length > 0)) {
            for (var j = 0; j < spl.length; j += 2) {
                var me = Game.Upgrades[this.batches[i][j/2]];
                me.unlocked = parseInt(spl[j]); me.bought = parseInt(spl[j+1]);
                if (me.bought && Game.CountsAsUpgradeOwned(me.pool)) Game.UpgradesOwned++;
            }
        }
    }
}

achiev_engine.saveAchievs = function() {
    var toCompress = [];
    for (var i in this.batches) {
        toCompress = [];
        this.batches[i].forEach((name) => {
            console.log(this.batches[i][j]);
            let me = Game.Achievements[name];
            toCompress.push(Math.min(me.won, 1));
        });
        en.setVar(i, toCompress.join('^'));
    }
}

achiev_engine.loadAchievs = function() {
    let spl = [];
    for (var i in this.batches) {
        spl = en.getVar(i).split('^');
        if (spl.length > 0) {
            for (var j = 0; j < spl.length; j ++) {
                console.log(this.batches[i][j]);
                var me = Game.Achievements[this.batches[i][j]];
                me.won = parseInt(spl[j]);
                if (me.won && Game.CountsAsAchievementOwned(me.pool)) Game.AchievementsOwned++;
            }
        }
    }
}

var Process = function (en) {

    upgrade_engine.upgradeQueue.forEach(function (upgrade) {
        upgrade.me = new Game.Upgrade(upgrade.name, upgrade.desc, upgrade.price, upgrade.icon);
        for (var i in upgrade.other) { // transfer
            Game.last[i] = upgrade.other[i];
        }
        if (Game.last.unlockAt) Game.UnlockAt.push({ cookies: Game.last.unlockAt, name: upgrade.name });
        if (Game.last.pool == 'prestige') Game.PrestigeUpgrades.push(Game.last);
        Game.last.order = upgrade.order + Game.last.id * 0.001;
        upgrade_engine.batches[upgrade.batch].push(Game.last.name);
    })

    // adding parents to heavenly upgrades (blame orteil, not me)
    upgrade_engine.upgradeQueue.forEach(function (upgrade) {
        if (upgrade.me.huParents) upgrade.me.parents = Array.from(upgrade.me.huParents, (x) => Game.Upgrades[x]);
    })

    achiev_engine.achievementQueue.forEach(function (achiev) {
        achiev.me = new Game.Achievement(achiev.name, achiev.desc, achiev.icon);
        for (var i in achiev.other) { // transfer
            Game.last[i] = achiev.other[i];
        }
        Game.last.order = Game.Achievements[achiev.prev].order + Game.last.id * 0.001;
        achiev_engine.batches[achiev.batch].push(Game.last.name);
    })

    en.saveCallback(function () {
        upgrade_engine.saveUpgrades();
        achiev_engine.saveAchievs();
    })
    en.loadCallback(function () {
        upgrade_engine.loadUpgrades();
        achiev_engine.loadAchievs();
    })
    LocalizeUpgradesAndAchievs();
    upgrade_engine.replaceQueue.forEach(function (repl) {
        repl.upgrade.ddesc = repl.newDesc;
    })
    achiev_engine.replaceQueue.forEach(function (repl) {
        repl.achiev.ddesc = repl.newDesc;
    })
}

export { building_engine, achiev_engine, upgrade_engine, Process }