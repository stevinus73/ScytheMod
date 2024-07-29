import "./shimmers.js";
import "./cps.js";
import "./constructs.js";

var engine={};

engine.init=function(){
    shimmer_engine.init();
}

engine.Notify=function(name, subtext, icon, tooltipFunc){
    Game.Notify(subtext,'<div class="title" style="font-size:18px;margin-top:-2px;">'+name+'</div>',icon);
	Game.NotifyTooltip(tooltipFunc.toString());
}