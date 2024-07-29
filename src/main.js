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
var fun = function (mod) {
    en = mod.engine;
    en.init();
}
var GetModule = function (promise, callback) {
    promise
        .then((module) => callback(module))
        .catch((e) => console.error(e));
}

var IC = {
    init: function () {
        GetModule(import("https://stevinus73.github.io/IdleCookies/src/engine/engine.js"), fun);
    },

    save: function () {
        return '';
    },

    load: function (str) {

    },
};
Game.registerMod("IdleCookies", IC);
