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

    });

    Game.registerHook('check', function() {
        if (Game.hasBuff('Frenzy') && Game.hasBuff('Dragonflight') 
            && Game.hasBuff('Dragon Harvest') && Game.hasBuff('Click frenzy') 
                && Game.hasBuff('Elder frenzy') && buildingSpecials()) {
            en.Notify("Grail", "Notification unlocked", [23,6]);
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
