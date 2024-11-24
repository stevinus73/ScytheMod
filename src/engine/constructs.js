import {injectCode, injectCodes} from "./utils.js";

var building_engine={};
var achiev_engine={};
var upgrade_engine={};
upgrade_engine.flavored_engine={};
upgrade_engine.hupgrade_engine={};

// building_engine.injectBuildingCpSMult=function(building,injectedCode){
//     return Function(`
//         ${Game.Objects[building].cps.toString().replace(`var mult=1`,
//         `var mult=1;`+injectedCode)}();
//       `);
// }

// upgrade_engine.flavored_engine.addNewFlavoredCookie=function(cost, multiplier, info) {
//     //placeholder

//     magic();
// }

//function magic() {
//    LocalizeUpgradesAndAchievs();
//}

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

var Process = function() {
    upgrade_engine.upgradeQueue.forEach(function(upgrade) {
        new Game.Upgrade(upgrade.name, upgrade.desc, upgrade.price, upgrade.icon);
        for (var i in upgrade.other) { // transfer
            Game.last[i] = upgrade.other[i];
        }
        Game.last.order = upgrade.order + Game.last.id*0.001;
    })
    LocalizeUpgradesAndAchievs();
    upgrade_engine.replaceQueue.forEach(function(repl) {
        repl.upgrade.ddesc = repl.newDesc;
    })
}

export { building_engine, achiev_engine, upgrade_engine, Process }