import {injectCode, injectCodes} from "./utils.js";

var building_engine={};
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

upgrade_engine.appendToUpgradeDesc = function(upgrade, newDesc) {
    var position = upgrade.ddesc.indexOf("<q>");
    upgrade.ddesc = [upgrade.ddesc.slice(0, position), " " + newDesc, upgrade.ddesc.slice(position)].join('');
}

upgrade_engine.replaceUpgradeDesc = function(upgrade, newDesc) {
    upgrade.ddesc = [newDesc, "<q>" + upgrade.ddesc.split("<q>")[1]].join('');
}

export { building_engine, upgrade_engine }