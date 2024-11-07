import {BModify} from "./buildings.js"
import {Research} from "./research.js"
import {General}  from  "./general.js"

var mod = {}

mod.Init = function(engine) {
    this.en = engine;
    this.research = Research;
    this.research._Initialize(en);
    this.bModify = BModify;
    this.bModify._Initialize(en);
    this.general = General;
    this.general._Initialize(en);
}

export { mod }