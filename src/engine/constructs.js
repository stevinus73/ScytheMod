import {injectCode, injectCodes} from "./utils.js";

var building_engine={};
var achiev_engine={};
achiev_engine.achievementQueue = [];

achiev_engine.addAchievement = function (name, desc, icon, prev, other) { 
    this.achievementQueue.push({
        name: name,
        desc: desc,
        icon: icon,
        prev: prev,
        other: other
    })
}

var upgrade_engine={};
upgrade_engine.flavored_engine={};
upgrade_engine.hupgrade_engine={};

upgrade_engine.replaceQueue = [];
upgrade_engine.upgradeQueue = [];
upgrade_engine.replaceDesc = function(upgrade, newDesc) {
    this.replaceQueue.push({
        upgrade: upgrade,
        newDesc: newDesc
    })
}

upgrade_engine.addUpgrade = function(name, desc, price, icon, order, other) {
    this.upgradeQueue.push({
        name: name,
        desc: desc,
        price: price,
        icon: icon,
        order: order,
        other: other
    })
}

upgrade_engine.appendToDesc = function(upgrade, newDesc) {
    var position = upgrade.ddesc.indexOf("<q>");
    this.replaceDesc(upgrade, [upgrade.ddesc.slice(0, position), " " + newDesc, upgrade.ddesc.slice(position)].join(''));
}

upgrade_engine.replaceDescPart = function(upgrade, newDesc) {
    this.replaceDesc(upgrade, [newDesc, "<q>" + upgrade.ddesc.split("<q>")[1]].join(''));
}

upgrade_engine.strReplace = function(upgrade, find, replace) {
    this.replaceDesc(upgrade, upgrade.ddesc.replace(find, replace));
}

var Process = function(en) {
    upgrade_engine.upgradeQueue.forEach(function(upgrade) {
        upgrade.me = new Game.Upgrade(upgrade.name, upgrade.desc, upgrade.price, upgrade.icon);
        for (var i in upgrade.other) { // transfer
            Game.last[i] = upgrade.other[i];
        }
        if (Game.last.unlockAt) Game.UnlockAt.push({cookies: Game.last.unlockAt, name: upgrade.name});
        Game.last.order = upgrade.order + Game.last.id*0.001;
        en.newVar("moddedUpUl"+Game.last.id, "int");
        en.newVar("moddedUpB"+Game.last.id, "int");
        en.setVar("moddedUpUl"+Game.last.id, 0);
        en.setVar("moddedUpB"+Game.last.id, 0);
    })
    achiev_engine.achievementQueue.forEach(function(achiev) {
        achiev.me = new Game.Achievement(achiev.name, achiev.desc, achiev.icon);
        for (var i in achiev.other) { // transfer
            Game.last[i] = achiev.other[i];
        }
        Game.last.order = Game.Achievements[achiev.prev].order + Game.last.id*0.001;
        en.newVar("moddedAchW"+Game.last.id, "int");
        en.setVar("moddedAchW"+Game.last.id, 0);
    })
    en.saveCallback(function() {
        upgrade_engine.upgradeQueue.forEach(function(up) {
            en.setVar("moddedUpUl"+up.id, up.me.unlocked);
            en.setVar("moddedUpB"+up.id, up.me.bought);
        })
        achiev_engine.achievementQueue.forEach(function(achiev) {
            en.setVar("moddedAchW"+achiev.id, achiev.me.won);
        })
    })
    en.loadCallback(function() {
        upgrade_engine.upgradeQueue.forEach(function(up) {
            up.me.unlocked = en.getVar("moddedUpUl"+up.id, up.me.unlocked);
            up.me.bought = en.getVar("moddedUpB"+up.id, up.me.bought);
        })
        achiev_engine.achievementQueue.forEach(function(achiev) {
            achiev.me.won = en.getVar("moddedAchW"+achiev.id, achiev.me.won);
        })
    })
    LocalizeUpgradesAndAchievs();
    upgrade_engine.replaceQueue.forEach(function(repl) {
        repl.upgrade.ddesc = repl.newDesc;
    })
}

export { building_engine, achiev_engine, upgrade_engine, Process }