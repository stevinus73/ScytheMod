import {BModify} from "./buildings.js"
import {Research} from "./research.js"

var mod = {}

mod.Init = function(engine) {
    this.en = engine;
    this.research = Research;
    this.research._Initialize(en);
    this.bModify = BModify;
    this.bModify._Initialize(en);
}

export { mod }