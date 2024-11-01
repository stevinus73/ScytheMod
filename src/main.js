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
    return js;
}

var el = LoadModule("https://stevinus73.github.io/ScytheMod/src/engine/engine.js");
var en;

var CreateMod = function (engine) {
    engine.IdlersPocket.LoadMod('ScytheMod', function(e) {
        var tl = LoadModule("https://stevinus73.github.io/ScytheMod/src/logic/l_loader.js");
        en = e;
        GetModule(tl, function(l) {
            if (en != undefined)
                l.mod.Load(en);
            console.log("Loaded mod!");
        })
    });
}

var GetModule = function (element, callback) {
    import(element.getAttribute('src'))
        .then((module) => callback(module))
        .catch((e) => console.error(e));
}
GetModule(el, CreateMod);
