var script=document.querySelector('script[src="https://stevinus73.github.io/ScytheMod/src/main.js"]')
script.setAttribute('type','module')

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
//LoadModule("https://stevinus73.github.io/IdleCookies/src/engine/engine.js");

var CreateMod = function () {
    IdlersPocket.LoadMod('ScytheMod', function(en) {
        //GetModule(import("https://stevinus73.github.io/ScytheMod/src/logic/buildings.js"), 
        LoadModule("https://stevinus73.github.io/ScytheMod/src/logic/buildings.js",
        function() {
            mod.load(en);
            console.log("Loaded mod!");
        })
    });
}

var GetModule = function (promise, callback) {
    promise
        .then((module) => callback(module))
        .catch((e) => console.error(e));
}
LoadModule("https://stevinus73.github.io/ScytheMod/src/engine/engine.js", CreateMod);
//GetModule(import("https://stevinus73.github.io/ScytheMod/src/engine/engine.js"), CreateMod);
