/**
 * this part of code probably unnecessary (who knows)
 */

var script = document.querySelector('script[src="https://stevinus73.github.io/IdleCookies/src/main.js"]');
/**
 * We are a module!
 */
script.setAttribute('type', 'module');

var LoadModule = function (url, callback, error) {
    var js = document.createElement('script');
    /**
     * Creates a module instead.
     */
    js.setAttribute('type', 'module');
    if (js.readyState) {
        js.onreadystatechange = function () {
            if (js.readyState === "loaded" || js.readyState === "complete") {
                js.onreadystatechange = null;
                if (callback) callback();
            }
        };
    }
    else if (callback) {
        js.onload = callback;
    }
    if (error) js.onerror = error;

    js.setAttribute('src', url);
    document.head.appendChild(js);
}
LoadModule("https://stevinus73.github.io/IdleCookies/src/engine/engine.js");
var en;
//replacing an existing canvas picture with a new one at runtime : Game.Loader.Replace('perfectCookie.png','imperfectCookie.png');
	//upgrades and achievements can use other pictures than icons.png; declare their icon with [posX,posY,'http://example.com/myIcons.png']
	//check out the "UNLOCKING STUFF" section to see how unlocking achievs and upgrades is done


function buildingSpecials() {
    var bs = 0;
    Object.entries(Game.goldenCookieBuildingBuffs).map(entry => {
        let buffName = entry[1][0];
        if (Game.hasBuff(buffName)) bs += 1;
    });
    return bs;
}

/**
 * Initializes the mod.
 */
var Initialize = function (mod) {
    en = mod.engine;
    //en.init();

    Game.registerHook('create', function() {
        en.customAch('Grail',loc("Perform a Grail combo, having <b>all five distinct golden cookie effects and Elder frenzy</b>.")
                    +'<q>The holy grail of noscum, one of the most powerful combos in Cookie Clicker. Just pause, and look at how far you\'ve come.</q>',[23,6],399999);

        en.customAch('How did we get here?',loc("Have <b>every golden cookie effect</b>.")
                    +'<q>This is actually probably illegal.</q>',[28,12],20000,true);
    });

    Game.registerHook('check', function() {
        if (Game.hasBuff('Frenzy') && Game.hasBuff('Dragonflight') 
            && Game.hasBuff('Dragon Harvest') && Game.hasBuff('Click frenzy')) {
            if (buildingSpecials() && Game.hasBuff('Elder frenzy')) {
                Game.Win('Grail');
            }
            if (buildingSpecials()>=20) {
                Game.Win('How did we get here?');
            }
        }
    });
}





var GetModule = function (promise, callback) {
    promise
        .then((module) => callback(module))
        .catch((e) => console.error(e));
}
var IC = {
    init: function () {
        GetModule(import("https://stevinus73.github.io/IdleCookies/src/engine/engine.js"), Initialize);
    },

    save: function () {
        return '';
    },

    load: function (str) {

    },
};
Game.registerMod("IdleCookies", IC);
