Game.LoadMod("https://zixuan75.github.io/IdleCookies/src/engine/engine.js");

var IC = {
    init: function() {
        engine.init();
    },

    save: function() {
        return '';
    },

    load: function(str) {

    },
};
Game.RegisterMod("IdleCookies", IC);
