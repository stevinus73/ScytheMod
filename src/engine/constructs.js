var building_engine={};
var upgrade_engine={};
upgrade_engine.flavored_engine={};
upgrade_engine.hupgrade_engine={};

building_engine.injectBuildingCpSMult=function(building,injectedCode){
    return Function(`
        ${Game.Objects[building].cps.toString().replace(`var mult=1`,
        `var mult=1;`+injectedCode)}();
      `);
}

upgrade_engine.flavored_engine.addNewFlavoredCookie=function(cost, multiplier, info) {
    //placeholder

    magic();
}

function magic() {
    LocalizeUpgradesAndAchievs();
}