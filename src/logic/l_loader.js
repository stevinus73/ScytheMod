import {BModify} from "./buildings.js"

var mod = {}

mod.Init = function(engine) {
    this.en = engine;
    this.bModify = BModify;
    this.bModify._Initialize(en);
}

export { mod }