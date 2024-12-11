import {ResetParams} from "./params.js"
import {BModify} from "./buildings.js"
import {Research} from "./research.js"
import {General} from "./modgeneral.js"
import {Clicks} from "./clicks.js"

var mod = {}

mod.Init = function(engine) {
    ResetParams();
    this.en = engine;
    this.research = Research;
    this.research._Initialize(this.en);
    this.clicks = Clicks;
    this.clicks._Initialize(this.en, this.research);
    this.bModify = BModify;
    this.bModify._Initialize(this.en, this.research);
    this.general = General;
    this.general._Initialize(this.en, this.research);
    this.en.Process();
}

export { mod }