import { shimmer_engine } from "./shimmers.js";
import "./cps.js";
import "./constructs.js";

var engine={};

engine.init=function(){
    console.log("Initializing!");
    shimmer_engine.init();
}

engine.customAch=function(name,desc,icon,order,shadow) {
    var ach=new Game.Achievement(name, desc, icon);
	ach.order=order+ach.id*0.001;
    if(shadow)Game.last.pool='shadow';
    LocalizeUpgradesAndAchievs();
	return ach;
}

engine.Notify=function(name, subtext, icon){
    Game.Notify(subtext,'<div class="title" style="font-size:18px;margin-top:-2px;">'+name+'</div>',icon);
}

export { engine };