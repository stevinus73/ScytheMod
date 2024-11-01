var script=document.querySelector('script[src="https://stevinus73.github.io/IdleCookies/src/main.js"]');
/**
 * We are a module!
 */
script.setAttribute('type','module');

var LoadModule=function(url,callback,error){
    var js=document.createElement('script');
    js.setAttribute('type','module');
    if (js.readyState){
	js.onreadystatechange=function() {
	    if (js.readyState==="loaded" || js.readyState==="complete") {
		js.onreadystatechange=null;
		if (callback) callback();
	    }
	};
    }
    else if (callback) {
	js.onload=callback;
    }
    if (error) js.onerror=error;
    js.setAttribute('src',url);
    document.head.appendChild(js);
}

LoadModule("https://stevinus73.github.io/ScytheMod/src/engine/engine.js");
import("https://stevinus73.github.io/ScytheMod/src/engine/engine.js").then((module) => {
    console.log(module);
});

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
