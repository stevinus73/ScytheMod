import {ResetParams} from "./params.js"
import {BModify} from "./buildings.js"
import {Research} from "./research.js"
import {General} from "./modgeneral.js"
import {Clicks} from "./clicks.js"
import {G} from "./golden.js"

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
    this.G = G;
    this.G._Initialize(this.en, this.research);
    this.en.Process();
    
    // misc stuff
    Game.Achievements['Speed baking I'].ddesc=loc("Get to <b>%1</b> baked in <b>%2</b>.",[loc("%1 cookie",LBeautify(1e6)),Game.sayTime(60*30*Game.fps)]);
    Game.Achievements['Speed baking II'].ddesc=loc("Get to <b>%1</b> baked in <b>%2</b>.",[loc("%1 cookie",LBeautify(1e6)),Game.sayTime(60*20*Game.fps)]);
    Game.Achievements['Speed baking III'].ddesc=loc("Get to <b>%1</b> baked in <b>%2</b>.",[loc("%1 cookie",LBeautify(1e6)),Game.sayTime(60*10*Game.fps)]);
    eval('Game.Logic='+Game.Logic.toString().replace('timePlayed<=1000*60*35','timePlayed<=1000*60*30'));
    eval('Game.Logic='+Game.Logic.toString().replace('timePlayed<=1000*60*25','timePlayed<=1000*60*20'));
    eval('Game.Logic='+Game.Logic.toString().replace('timePlayed<=1000*60*15','timePlayed<=1000*60*10'));


    Game.ModLoaded=true;
    Game.LoadSave();
}

export { mod }