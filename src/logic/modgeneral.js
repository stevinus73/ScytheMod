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

    General.canShiny = function(){return Research.has("Plain cookie");}
    General.shinies = []
    const shinyPower=50
    const shinyPowerAsc=10

    General.newShinyCookie = function(name, desc, price, icon){
        en.ue.addUpgrade(name, desc, price, icon, 10400, {
            descFunc: function(){return getStrCookieProductionMultiplierPlus(Game.resets?shinyPowerAsc:shinyPower)+'<q>'+desc+'</q>'}
        })
        this.shinies.push(name)
    }

    General.newShinyCookie("Star cookie", "Glimmers and shines like a star. May supernova at some point.", 1e4, [10, 0])
    General.newShinyCookie("Emerald cookie", "Beautiful, marvelous, incredible, sublime.", 1e6, [10, 0])
    General.newShinyCookie("Diamond cookie", "1 in 8,192 chance!", 1e8, [10, 0])
    General.newShinyCookie("Silver cookie", "Tastes pretty meh, but the shininess is the real special part about all of these cookies.", 1e10, [10, 0])
    General.newShinyCookie("Tungsten cookie", "The legends didn't lie.", 1e12, [10, 0])

    Game.registerHook('logic', function(){
        General.shinies.forEach(function(shiny) {
            var me=Game.Upgrades[shiny]
            if (General.canShiny() && Game.cookiesEarned >= me.price/20){Game.Unlock(shiny);}
        })
    })

    Game.registerHook('cps', function(cps) {
        var mult=1;
        General.shinies.forEach(function(shiny) {
            var me=Game.Upgrades[shiny]
            if (me.bought) mult*=1+0.01*(Game.resets?shinyPowerAsc:shinyPower)
        })
        return cps*mult
    })
}
export { General }