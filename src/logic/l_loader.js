import {BModify} from "./buildings.js"
import {Research} from "./research.js"
import {General} from "./modgeneral.js"

var mod = {}

mod.Init = function(engine) {
    this.en = engine;
    this.research = Research;
    this.research._Initialize(this.en);
    this.bModify = BModify;
    this.bModify._Initialize(this.en, this.research);
    this.general = General;
    this.general._Initialize(this.en, this.research);
    this.en.Process();
}

export { mod }