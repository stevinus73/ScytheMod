var script=document.querySelector('script[src="https://stevinus73.github.io/ScytheMod/src/main.js"]')
script.setAttribute('type','module')

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

    js.setAttribute('src', url);
    document.head.appendChild(js);
    return js;
}

var el = LoadModule("https://stevinus73.github.io/ScytheMod/src/engine/engine.js");
var en;

var CreateMod = function (engine) {
    en = engine.IdlersPocket;
    en.LoadMod('ScytheMod', function() {
        var tl = LoadModule("https://stevinus73.github.io/ScytheMod/src/logic/l_loader.js");
        GetModule(tl, function(l) {
            l.mod.Init(en);
            console.log("Loaded ScytheMod - This may have compatibility issues, so beware of mixing it with other mods.");
            Game.Notify("This is ScytheMod, an experimental mod for Cookie Clicker. Careful!",
                '<div class="title" style="font-size:18px;margin-top:-2px;">Welcome!</div>',[23, 6]);
        })
    });
}

var GetModule = function (element, callback) {
    import(element.getAttribute('src'))
        .then((module) => callback(module))
        .catch((e) => console.error(e));
}
GetModule(el, CreateMod);
