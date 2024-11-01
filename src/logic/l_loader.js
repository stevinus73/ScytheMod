import {buildings} from "./buildings.js"

var mod = {}

mod.Load = function(engine) {
    this.en = engine;
    buildings._Initialize(en);
}

export { mod }