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
    General.GardenEdit = function() {
        if (Game.Objects.Farm.minigame) {
            var m = Game.Objects.Farm.minigame;
            m.plotLimits=[
                [1,1,5,5],
                [1,1,6,5],
                [1,1,6,6],
                [0,1,6,6],
                [0,0,6,6]
            ];
        }
    }
    this.GardenEdit();
    this.TempleRename();
    this.GrimoireRename();
    Game.scriptLoaded = en.injectCode(Game.scriptLoaded, "who.minigame.launch();", "\n\tif(who.id==2){mod.general.GardenEdit();}", "after");
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
    General.newShinyCookie("Tungsten cookies", "The legends didn't lie.", 1e16, [2, 5, Icons])
    General.newShinyCookie("Big-bang nucleosynthesized cookies", "From the beginning of time itself.", 1e20, [2, 1, Icons])

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
    // beeg buff?
    General.replacePower = function(upgrade, newPower) {
        var me = Game.Upgrades[upgrade];
        if (!me) return;
        en.ue.strReplace(me, me.power, newPower);
        me.power = newPower;
    }
    this.replacePower('Peanut butter cookies',10);
    this.replacePower('Coconut cookies',10);
    this.replacePower('White chocolate cookies',10);
    this.replacePower('Macadamia nut cookies',10);
    this.replacePower('Cashew cookies',10);
    this.replacePower('Almond cookies',10);
    this.replacePower('Hazelnut cookies',10);
    this.replacePower('Walnut cookies',10);
    this.replacePower('Double-chip cookies',4);
    this.replacePower('White chocolate macadamia nut cookies',4);
    this.replacePower('All-chocolate cookies',4);
    this.replacePower('Eclipse cookies',7);
    this.replacePower('Zebra cookies',3);
    this.replacePower('Snickerdoodles',3);
    this.replacePower('Stroopwafels',3);
    this.replacePower('Macaroons',3);
    this.replacePower('Empire biscuits',3);
    this.replacePower('Madeleines',8);
    this.replacePower('Palmiers',3);
    this.replacePower('Palets',3);
    this.replacePower('Gingerbread men',3);
    this.replacePower('Gingerbread trees',3);
    // var heartPower=function(){
    //     var pow=6;
    //     if (Game.Has('Starlove')) pow=9;
    //     if (Game.hasGod)
    //     {
    //         var godLvl=Game.hasGod('seasons');
    //         if (godLvl==1) pow*=1.3;
    //         else if (godLvl==2) pow*=1.2;
    //         else if (godLvl==3) pow*=1.1;
    //     }
    //     return pow;
    // };
    // Game.heartDrops.forEach(drop => {Game.Upgrades[drop].power=heartPower;})

    // SANTA
    Game.ToggleSpecialMenu=en.injectCode(Game.ToggleSpecialMenu, 
        `str+='<h3 style="pointer-events:none;">'+Game.santaLevels[Game.santaLevel]+'</h3>';`,
        `\n\t\t\t\t\tif (Game.santaLevel>=14) str+=mod.general.getSantaDiv();`, 
        "after");
    Game.CalculateGains=en.injectCode(Game.CalculateGains,
        "mult*=1.2;", 
        "mult*=(1+mod.general.santaBoost);",
        "replace");
    en.ue.strReplace(Game.Upgrades['Santa\'s dominion'],getStrCookieProductionMultiplierPlus(20),"Santa gives a <b>fluctuating CpS boost</b>.");

    this.santaBoost=0;
    this.dSantaL=0;
    this.dSantaR=0;
    this.santaDiff=0;
    this.lastSantaMode='';
    
    this.getSantaDiv=function() {
        return '<div style="text-align:center;margin-bottom:4px;margin-top:4px;">'
            +'<div style="'+writeIcon([19,10])+' width:48px;height:48px;transform:scale(0.5);position:absolute;left:45px;top:10px;" '
            +'class="usesIcon shadowFilter"></div>'
            +'Current Santa boost: <b>+'+Beautify(100*this.santaBoost,1)+'%</b></div>';
    }

    this.updateSanta=function() {
        if (!Game.Has('Santa\'s dominion')) {this.santaBoost=0;return;}
        this.santaDiff=Math.max(Math.min(this.santaDiff,5),-2);
        if (this.timeSinceLast>=Game.fps*60*30) this.santaDiff+=0.0004;
        this.santaBoost*=(1+Math.random()*(this.dSantaR-this.dSantaL)+this.dSantaL+0.001*this.santaDiff);
        this.santaBoost=Math.max(Math.min(this.santaBoost,4),0.2);
    }

    this.updateSanta_D=function() {
        var modes=['rise', 'fall', 'rise', 'fall', 'fast rise', 'fast fall', 'chaotic'];
        if(this.lastSantaMode) modes.push(this.lastSantaMode, this.lastSantaMode, this.lastSantaMode);
        var santaMode=choose(modes);
        if (santaMode=='rise') {
            this.dSantaL=-0.0003;
            this.dSantaR= 0.0015;
        }
        if (santaMode=='fall') {
            this.dSantaL=-0.0015;
            this.dSantaR= 0.0003;
        }
        if (santaMode=='fast rise') {
            this.dSantaL=-0.0005;
            this.dSantaR= 0.005;
        }
        if (santaMode=='fast fall') {
            this.dSantaL=-0.005;
            this.dSantaR= 0.0005;
        }
        if (santaMode=='chaotic') {
            this.dSantaL=-0.01;
            this.dSantaR= 0.01;
        }
        this.lastSantaMode=santaMode;
    }

    // activity check
    this.timeSinceLast=0;
    Game.loseShimmeringVeil=en.injectCode(Game.loseShimmeringVeil,
        `if (!Game.Has('Shimmering veil')) return false;`,
        `mod.general.activityCheck();\n\t\t\t`,
        "before");

    this.activityCheck=function() {
        this.timeSinceLast=0;
        this.santaDiff-=0.3;
    }

    Game.registerHook('logic', function() {
        if (Game.T%(Game.fps)==0) General.updateSanta();
        if (Game.T%(Game.fps*30)==0) General.updateSanta_D();
        General.timeSinceLast++;
    });
}
export { General }