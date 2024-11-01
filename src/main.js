var script=document.querySelector('script[src="https://stevinus73.github.io/ScytheMod/src/main.js"]')
script.setAttribute('type','module')
import("https://stevinus73.github.io/ScytheMod/src/engine/engine.js")

var CreateMod = function (mod) {
    en = mod.IdlersPocket;
    en.LoadMod('ScytheMod', function(Id) {
        console.log("Loaded mod!");
    });

    // Game.registerHook('create', function() {
    //     en.customAch('Grail',loc("Perform a Grail combo, having <b>all five distinct golden cookie effects and Elder frenzy</b>.")
    //                 +'<q>The holy grail of noscum, one of the most powerful combos in Cookie Clicker. Just pause, and look at how far you\'ve come.</q>',[23,6],399999);

    //     en.customAch('How did we get here?',loc("Have <b>every golden cookie effect</b>.")
    //                 +'<q>This is actually probably illegal.</q>',[28,12],20000,true);
    // });

    // Game.registerHook('check', function() {
    //     if (Game.hasBuff('Frenzy') && Game.hasBuff('Dragonflight') 
    //         && Game.hasBuff('Dragon Harvest') && Game.hasBuff('Click frenzy')) {
    //         if (buildingSpecials() && Game.hasBuff('Elder frenzy')) {
    //             Game.Win('Grail');
    //         }
    //         if (buildingSpecials()>=20) {
    //             Game.Win('How did we get here?');
    //         }
    //     }
    // });
}





var GetModule = function (promise, callback) {
    promise
        .then((module) => callback(module))
        .catch((e) => console.error(e));
}
GetModule(import("https://stevinus73.github.io/ScytheMod/src/engine/engine.js"), CreateMod);
