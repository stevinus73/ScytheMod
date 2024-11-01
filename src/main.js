var script=document.querySelector('script[src="https://stevinus73.github.io/ScytheMod/src/main.js"]')
script.setAttribute('type','module')
import("https://stevinus73.github.io/ScytheMod/src/engine/engine.js")

var SM = {
    init: function() {
        engine.init();
    },

    save: function() {
        return '';
    },

    load: function(str) {

    },
};
Game.registerMod("ScytheMod", SM);
