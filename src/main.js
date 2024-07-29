var script=document.querySelector('script[src="https://stevinus73.github.io/IdleCookies/src/main.js"]');
/**
 * We are a module!
 */
script.setAttribute('type','module');

var LoadModule=function(url,callback,error)
{
	var js=document.createElement('script');
    /**
     * Creates a module instead.
     */
	js.setAttribute('type','module');
	if (js.readyState){
		js.onreadystatechange=function()
		{
			if (js.readyState==="loaded" || js.readyState==="complete")
			{
				js.onreadystatechange=null;
				if (callback) callback();
			}
		};
	}
	else if (callback)
	{
		js.onload=callback;
	}
	if (error) js.onerror=error;
	
	js.setAttribute('src',url);
	document.head.appendChild(js);
}
LoadModule("https://stevinus73.github.io/IdleCookies/src/engine/engine.js");

var en;
import("https://stevinus73.github.io/IdleCookies/src/engine/engine.js").then((module) => {
    en = module.engine;
}).catch(function(e) {
    en={};
    console.error(e);
});

var IC = {
    init: function() {
        if(en) en.init();
    },

    save: function() {
        return '';
    },

    load: function(str) {

    },
};
Game.registerMod("IdleCookies", IC);
