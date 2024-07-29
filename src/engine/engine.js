import './shimmers.js';
import './constructs.js';
import './cps.js';

var engine={};

engine.Notify=function(name, subtext, icon, tooltipFunc){
    Game.Notify(subtext,'<div class="title" style="font-size:18px;margin-top:-2px;">'+name+'</div>',icon);
	Game.NotifyTooltip(tooltipFunc.toString());
}