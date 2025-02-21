var src=Game._Path??("https://rawcdn.githack.com/stevinus73/ScytheMod/"+(Game._Version??"v0.2.0-alpha")+"/");
var CodeUrl = function(url) {return src+"src/"+url};
var ImageUrl = function(url) {return src+"img/"+url};
var Icons = ImageUrl("icons.png");
var Kaizo = Game.mods["Kaizo Cookies"];
var Clysm = Game.mods["Cookieclysm"];

// loading
var script=document.querySelector('script[src="https://stevinus73.github.io/ScytheMod/src/main.js"]');
script.setAttribute('type','module');

var LoadModule = function (url, callback, error) {
    var js = document.createElement('script');
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
    js.setAttribute('src', CodeUrl(url));
    document.head.appendChild(js);
    return js;
}

var el = LoadModule("engine/engine.js");
var en;
var mod;
var P={};

var CreateMod = function (engine) {
    en = engine.IdlersPocket;
    en.LoadMod('ScytheMod', function() {
        console.log("Loaded ScytheMod - This may have compatibility issues, so beware of mixing it with other mods.");
        var tl = LoadModule("logic/l_loader.js");
        GetModule(tl, function(l) {
            mod = l.mod;
            mod.Init(en);
            en.ModLoaded = true;
		    Game.LoadSave();
        })
    })
}

var GetModule = function (element, callback) {
    import(element.getAttribute('src'))
        .then((module) => callback(module))
        .catch((e) => console.error(e));
}
GetModule(el, CreateMod);
