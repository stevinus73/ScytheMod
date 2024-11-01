import {buildings} from "./buildings.js"

mod = {}

mod.Load = function(engine) {
    this.en = engine;
    buildings._Initialize(en);
}

export { mod }