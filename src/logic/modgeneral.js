var General = {}

General._Initialize = function(en, Research) {
    this.en = en;

    /**
     * Nerfing Thousand Fingers
     */

    function fingersNerf(F) {
        return en.injectMult(F, 
            [["if (Game.Has('Unshackled cursors')) add*=	25;", "if (Game.Has('Unshackled cursors')) add*=	5;"],
            ["if (Game.Has('Trillion fingers')) add*=		20;", "if (Game.Has('Trillion fingers')) add*=		10;"],
            ["if (Game.Has('Quadrillion fingers')) add*=	20;", "if (Game.Has('Quadrillion fingers')) add*=	10;"],
            ["if (Game.Has('Quintillion fingers')) add*=	20;", "if (Game.Has('Quintillion fingers')) add*=	10;"]], "replace");
    }
    Game.mouseCps = fingersNerf(Game.mouseCps);
    Game.Objects['Cursor'].cps = fingersNerf(Game.Objects['Cursor'].cps);
    en.ue.strReplace(Game.Upgrades['Unshackled cursors'], "25", "5");
    en.ue.strReplace(Game.Upgrades['Trillion fingers'], "20", "10");
    en.ue.strReplace(Game.Upgrades['Quadrillion fingers'], "20", "10");
    en.ue.strReplace(Game.Upgrades['Quintillion fingers'], "20", "10");

    /**
     * Name changes + effect deletion (uses eval but this shouldn't really matter due to Game.loadMinigames rarely being called)
     */

    General.TempleRename = function() {
        if (Game.Objects.Temple.minigame) { 
            var m = Game.Objects.Temple.minigame;
            m.gods['industry'].desc1 = '<span class="green">Increases resource use rate by 30%.</span>';
            m.gods['industry'].desc2 = '<span class="green">Increases resource use rate by 20%.</span>';
            m.gods['industry'].desc3 = '<span class="green">Increases resource use rate by 10%.</span>';
            m.gods['creation'].desc1 = '<span class="green">Increases yield by 8%.</span> <span class="red">Decreases resource use rate by 25%.</span>';
            m.gods['creation'].desc2 = '<span class="green">Increases yield by 6%.</span> <span class="red">Decreases resource use rate by 20%.</span>';
            m.gods['creation'].desc3 = '<span class="green">Increases yield by 4%.</span> <span class="red">Decreases resource use rate by 15%.</span>';
            m.gods['ruin'].desc1 += ' <span class="red">Buff increases clicks used by +0.5% for every building sold for 10 seconds.</span>',
			m.gods['ruin'].desc1 += ' <span class="red">Buff increases clicks used by +0.3% for every building sold for 10 seconds.</span>',
			m.gods['ruin'].desc1 += ' <span class="red">Buff increases clicks used by +0.1% for every building sold for 10 seconds.</span>',
            eval("Game.Objects.Temple.minigame.godTooltip="+Game.Objects.Temple.minigame.godTooltip.toString().replace('{',"{M=Game.Objects.Temple.minigame;"));
            eval("Game.Objects.Temple.minigame.slotTooltip="+Game.Objects.Temple.minigame.slotTooltip.toString().replace('{',"{M=Game.Objects.Temple.minigame;"));
            // eval("Game.Objects.Temple.minigame.draw="+Game.Objects.Temple.minigame.draw.toString().replace(
            //     'else if (M.swaps==1) t=1000*60*60*4;', 
            //     'else if (M.swaps==1) t=1000*60*60*4;\n\tif (mod.research.has("Polytheism")) t*=0.75;')
            // );
            // eval("Game.Objects.Temple.minigame.logic="+Game.Objects.Temple.minigame.logic.toString().replace(
            //     'else if (M.swaps==1) t=1000*60*60*4;', 
            //     'else if (M.swaps==1) t=1000*60*60*4;\n\tif (mod.research.has("Polytheism")) t*=0.75;')
            // );
        }
    }
    General.GrimoireRename = function() {
        if (Game.Objects['Wizard tower'].minigame) { 
            var m = Game.Objects['Wizard tower'].minigame;
            // m.spells['summon crafty pixies'].desc = "Resources are used up 50% slower, without any CpS decrease for 1 minute.";
            // m.spells['summon crafty pixies'].failDesc = "Resources are used up 25% faster, without any CpS increase for 1 hour.";
        }
    }
    this.TempleRename();
    this.GrimoireRename();
    Game.scriptLoaded = en.injectCode(Game.scriptLoaded, "who.minigame.launch();", "\n\tif(who.id==6){mod.general.TempleRename();}", "after");
    Game.scriptLoaded = en.injectCode(Game.scriptLoaded, "who.minigame.launch();", "\n\tif(who.id==7){mod.general.GrimoireRename();}", "after");
    
    // delete the old effect
    Game.CalculateGains = en.injectCode(Game.CalculateGains, "var godLvl=Game.hasGod('industry');", "var godLvl=0;", "replace");
    Game.shimmerTypes.golden.getTimeMod = en.injectCode(Game.shimmerTypes.golden.getTimeMod, "var godLvl=Game.hasGod('industry');", "var godLvl=0;", "replace");
    Game.GetHeavenlyMultiplier = en.injectCode(Game.GetHeavenlyMultiplier, "var godLvl=Game.hasGod('creation');", "var godLvl=0;", "replace");
    Game.modifyBuildingPrice = en.injectCode(Game.modifyBuildingPrice, "var godLvl=Game.hasGod('creation');", "var godLvl=0;", "replace");

    /**
     * Updating buff timers (this took longer than you'd think it would)
     */

    General.buffTooltip = function(buff) {
        if (!buff) return;
        var desc=buff.type.func((buff.time/Game.fps), buff.arg1, buff.arg2, buff.arg3).desc; // might not be the best way to do this
        return '<div class="prompt" style="min-width:200px;text-align:center;font-size:11px;margin:8px 0px;" id="tooltipBuff"><h3>'+buff.dname+'</h3><div class="line"></div>'+desc+'</div>';
    }
    Game.gainBuff = en.injectCode(Game.gainBuff, "Game.getTooltip(", "Game.getDynamicTooltip(", "replace")
    Game.gainBuff = en.injectCode(Game.gainBuff, 
        `'<div class="prompt" style="min-width:200px;text-align:center;font-size:11px;margin:8px 0px;" id="tooltipBuff"><h3>'+buff.dname+'</h3><div class="line"></div>'+buff.desc+'</div>'`, 
        `"function(){return mod.general.buffTooltip(Game.buffs['"+buff.name+"']);}"`, 
        "replace"
    )

    /**
     * Shiny cookies
     */

    General.canShiny = function(){return Research.has("Shiny cookies");}
    General.shinies = []
    var strCookieProductionMultiplierPlus=loc("Cookie production multiplier <b>+%1%</b>.",'[x]');
	var getStrCookieProductionMultiplierPlus=function(x)
	{return strCookieProductionMultiplierPlus.replace('[x]',x);}
    General.shinyPower = function(){
        if(Game.resets==0) return P.shinyPower[0];
        if(Game.resets==1) return P.shinyPower[1];
        if(Game.resets==2) return P.shinyPower[2];
        return P.shinyPower[3];
    }

    General.newShinyCookie = function(name, desc, price, icon){
        en.ue.addUpgrade(name, desc, price, icon, 10400, {
            descFunc: function(){return getStrCookieProductionMultiplierPlus(General.shinyPower())+'<q>'+desc+'</q>'}
        })
        this.shinies.push(name)
    }

    General.newShinyCookie("Star cookies", "Glimmers and shines like a star. May supernova eventually.", 1e4, [2, 2, Icons])
    General.newShinyCookie("Emerald cookies", "Beautiful, marvelous, incredible, sublime.", 1e6, [2, 3, Icons])
    General.newShinyCookie("Diamond cookies", "1 in 8,192 chance!", 1e8, [2, 4, Icons])
    General.newShinyCookie("Silver cookies", "Tastes pretty meh, but the shininess is the real special part about all of these cookies.", 1e11, [2, 5, Icons])
    General.newShinyCookie("Tungsten cookies", "The legends didn't lie.", 1e14, [2, 5, Icons])
    General.newShinyCookie("Big-bang nucleosynthesized cookies", "From the beginning of time itself.", 1e17, [2, 1, Icons])

    Game.registerHook('logic', function(){
        General.shinies.forEach(function(shiny) {
            var me=Game.Upgrades[shiny]
            if (General.canShiny() && (Game.cookiesEarned >= me.basePrice/20)){Game.Unlock(shiny);}
        })
    })

    Game.registerHook('cps', function(cps) {
        var mult=1;
        General.shinies.forEach(function(shiny) {
            var me=Game.Upgrades[shiny]
            if (me.bought) mult*=1+0.01*(General.shinyPower())
        })
        return cps*mult
    })
}
export { General }