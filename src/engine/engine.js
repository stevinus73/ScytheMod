Game.LoadMod("https://zixuan75.github.io/IdleCookies/src/engine/shimmers.js");
Game.LoadMod("https://zixuan75.github.io/IdleCookies/src/engine/constructs.js");
Game.LoadMod("https://zixuan75.github.io/IdleCookies/src/engine/cps.js");

var engine={};

engine.init=function(){
    shimmer_engine.init();
}

engine.Notify=function(name, subtext, icon, tooltipFunc){
    Game.Notify(subtext,'<div class="title" style="font-size:18px;margin-top:-2px;">'+name+'</div>',icon);
	Game.NotifyTooltip(tooltipFunc.toString());
}