var script=document.querySelector('script[src="https://stevinus73.github.io/ScytheMod/src/main.js"]')
script.setAttribute('type','module')

var CreateMod = function (mod) {
    en = mod.IdlersPocket;
    en.LoadMod('ScytheMod', function(Id) {
        console.log("Loaded mod!");
    });
}

var GetModule = function (promise, callback) {
    promise
        .then((module) => callback(module))
        .catch((e) => console.error(e));
}
GetModule(import("https://stevinus73.github.io/ScytheMod/src/engine/engine.js"), CreateMod);
