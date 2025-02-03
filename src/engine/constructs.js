import {injectCode, injectCodes} from "./utils.js";

var FirstUpgrade=Game.UpgradesById.length;

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
        if (Game.last.pool=='prestige') Game.PrestigeUpgrades.push(Game.last);
        Game.last.order = upgrade.order + Game.last.id*0.001;
        en.newVar("upPacked", "string");
    })

    // adding parents to heavenly upgrades (blame orteil, not me)
    upgrade_engine.upgradeQueue.forEach(function(upgrade) {
        if (upgrade.me.huParents) upgrade.me.parents=Array.from(upgrade.me.huParents, (x)=>Game.Upgrades[x]);
    })

    achiev_engine.achievementQueue.forEach(function(achiev) {
        achiev.me = new Game.Achievement(achiev.name, achiev.desc, achiev.icon);
        for (var i in achiev.other) { // transfer
            Game.last[i] = achiev.other[i];
        }
        Game.last.order = Game.Achievements[achiev.prev].order + Game.last.id*0.001;
        en.newVar("achPacked", "string");
    })
    en.saveCallback(function() {
        var toCompress=[];
        upgrade_engine.upgradeQueue.forEach(function(up) {
            toCompress.push(up.me.id,[Math.min(up.me.unlocked,1),Math.min(up.me.bought,1)].join(''));
        })
        en.setVar("upPacked", toCompress.join(' '));

        toCompress=[];
        achiev_engine.achievementQueue.forEach(function(achiev) {
            toCompress.push(achiev.me.id,Math.min(achiev.me.won));
        })
        en.setVar("achPacked", toCompress.join(' '));
    })
    en.loadCallback(function() {
        var spl=en.hasVariable("upPacked")?en.getVar("upPacked").split(' '):[];
        for (var i=0;i<spl.length;i+=2){
            var mestr=[spl[i],spl[i+1]];
            var me=Game.UpgradesById[parseInt(mestr[0])];
            var packedstr=mestr[1].split('');
            me.unlocked=parseInt(packedstr[0]);me.bought=parseInt(packedstr[1]);
            if (me.bought && Game.CountsAsUpgradeOwned(me.pool)) Game.UpgradesOwned++;
        }
        spl=en.hasVariable("achPacked")?en.getVar("achPacked").split(' '):[];
        for (var i=0;i<spl.length;i+=2){
            var mestr=[spl[i],spl[i+1]];
            var me=Game.AchievementsById[parseInt(mestr[0])];
            me.won=parseInt(mestr[1]);
            if (me.bought && Game.CountsAsAchievementOwned(me.pool)) Game.AchievementsOwned++;
        }
    })
    LocalizeUpgradesAndAchievs();
    upgrade_engine.replaceQueue.forEach(function(repl) {
        repl.upgrade.ddesc = repl.newDesc;
    })
}

export { building_engine, achiev_engine, upgrade_engine, Process }