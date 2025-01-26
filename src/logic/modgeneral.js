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
			m.gods['ruin'].desc2 += ' <span class="red">Buff increases clicks used by +0.3% for every building sold for 10 seconds.</span>',
			m.gods['ruin'].desc3 += ' <span class="red">Buff increases clicks used by +0.1% for every building sold for 10 seconds.</span>',
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
    function gardenEval(fstr){return fstr.replace('{',"{M=Game.Objects.Farm.minigame;").replaceAll('y<6;','y<7;').replaceAll('x<6;','x<7;')};
    General.GardenEdit = function() {
        if (Game.Objects.Farm.minigame) {
            var m = Game.Objects.Farm.minigame;
            m.resetPlot = function() {
                m.plot=Array(7).fill([0,0]).map(() => Array(7))
                m.plotBoost=Array(7).fill([1,1,1]).map(() => Array(7))
            }
            m.resetPlot();
            m.plants = function() {
                var plants=0;
                for (var y=0;y<7;y++) {
                    for (var x=0;x<7;x++) {
                        if (this.plot[y][x]>0) plants++;
                    }
                }
                return plants;
            }
            eval("Game.Objects.Farm.minigame.buildPlot="+gardenEval(m.buildPlot.toString())
                .replace('Math.min(6,Y+s+1)','Math.min(7,Y+s+1)')
                .replace('Math.min(6,X+s+1)','Math.min(7,X+s+1)')
                .replace('if (plants>=6*6)','if (plants>=7*7)')
                .replace("if (!l('gardenTile-0-0'))","if (!l('gardenTile-7-7'))"));
            eval("Game.Objects.Farm.minigame.computeBoostPlot="+gardenEval(m.computeBoostPlot.toString()));
            eval("Game.Objects.Farm.minigame.reset="+gardenEval(m.reset.toString()));
            eval("Game.Objects.Farm.minigame.logic="+gardenEval(m.logic.toString()));
            // all plants become 5% less efficient per plant placed above the max of 36
            eval("Game.Objects.Farm.minigame.computeEffs="+gardenEval(m.computeEffs.toString())
                    .replace('mult*=M.plotBoost[y][x][1];','mult*=M.plotBoost[y][x][1];mult*=Math.pow(0.95,Math.max(M.plants()-36,0));'));
            eval("Game.Objects.Farm.minigame.harvestAll="+gardenEval(m.harvestAll.toString()));
            eval("Game.Objects.Farm.minigame.save="+gardenEval(m.save.toString()));
            eval("Game.Objects.Farm.minigame.getTile="+m.getTile.toString().replace('x>5','x>6').replace('y>5','y>6'));
            eval("Game.Objects.Farm.minigame.tools['freeze'].func="+gardenEval(m.tools['freeze'].func.toString()));
            m.plotLimits=[
                [1,1,5,5],
                [1,1,6,5],
                [1,1,6,6],
                [0,1,6,6],
                [0,0,6,6],
                [0,0,6,7],
                [0,0,7,7]
            ];
            if (l('gardenPlot')){ l('gardenPlot').style.width='280px'; l('gardenPlot').style.height='280px'; }
            if (l('gardenContent')) {l('gardenContent').style.height='392px'; }

            m.toRebuild=true;
            // soils change
            m.soils.dirt.tick=3;
            m.soils.dirt.effsStr=m.soils.dirt.effsStr.replace(
                loc("tick every %1",'<b>'+Game.sayTime(5*60*Game.fps)+'</b>'),
                loc("tick every %1",'<b>'+Game.sayTime(3*60*Game.fps)+'</b>')
            )
            m.soils.fertilizer.tick=2;
            m.soils.fertilizer.effsStr=m.soils.fertilizer.effsStr.replace(
                loc("tick every %1",'<b>'+Game.sayTime(3*60*Game.fps)+'</b>'),
                loc("tick every %1",'<b>'+Game.sayTime(2*60*Game.fps)+'</b>')
            )
            m.soils.pebbles.tick=10;
            m.soils.pebbles.effsStr=m.soils.pebbles.effsStr.replace(
                loc("tick every %1",'<b>'+Game.sayTime(5*60*Game.fps)+'</b>'),
                loc("tick every %1",'<b>'+Game.sayTime(10*60*Game.fps)+'</b>')
            )

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
            +'<div style="'+writeIcon([19,10])+' width:48px;height:48px;transform:scale(0.7);" '
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

    // SUGAR LUMPS

    // sucralosia inulitis makes every lump have a 50% chance to gain an extra lump
    Game.harvestLumps=en.injectCode(Game.harvestLumps,
        `if (Game.lumpCurrentType==1 && Game.Has('Sucralosia Inutilis') && Math.random()<0.05) total*=2;`,
        `if (Game.lumpCurrentType==1 && Game.Has('Sucralosia Inutilis') && Math.random()<0.05) total*=1;`,
        "replace");
    Game.harvestLumps=en.injectCode(Game.harvestLumps,
        `total=Math.floor(total);`,
        `\n\t\t\tif (total>0 && Game.Has('Sucralosia Inutilis') && Math.random()<0.5) total+=1;`,
        "after");
    Game.computeLumpType=en.injectCode(Game.computeLumpType,
        `if (Math.random()<(Game.Has('Sucralosia Inutilis')?0.15:0.1)) types.push(1);`,
        `if (Math.random()<0.1) types.push(1);`,
        "replace");
    en.ue.replaceDescPart(Game.Upgrades['Sucralosia Inutilis'], 
        "Upon harvesting a sugar lump, there is a <b>50% chance</b> that <b>one more lump</b> is dropped."    
    )

    Game.loadLumps=en.injectCode(Game.loadLumps,`Math.floor(age/Game.lumpOverripeAge)`,
        `Math.floor((age/Game.lumpOverripeAge)*(Game.Has('Sucralosia Inutilis')?1.5:1));`, "replace"
    )

    // RANDOM OTHER UPGRADES

    en.ue.addUpgrade("Dyson spheres", "Shipments gain <b>+7%</b> CpS per prism. Prisms gain <b>+0.7%</b> CpS per shipment."
        +'<q>Not related to the much more underwhelming normal upgrade of the same name.</q>',
        4000000000000000, [1,4,Icons], 768, {pool: 'prestige', posX: 1450, posY: 32.130, parents: 
            [Game.Upgrades['Unshackled shipments']]}
    );

    en.ue.addUpgrade("Dragon wingtip", "Shipments gain <b>+25%</b> CpS (multiplicative) per dragon level."
        +'<br>'+loc("Cost scales with CpS, but %1 times cheaper with a fully-trained dragon.",10)
        +'<q>A tiny wingtip shed from your dragon. This imbues you with the power of flight.</q>',
        1000000000, [5,24], 25100, {priceFunc:function(me){return Game.unbuffedCps*60*30*((Game.dragonLevel<Game.dragonLevels.length-1)?1:0.1);}}
    );

    Game.magicCpS=function(what){
        if (what=='Shipment') {
            return (Game.Has("Dragon wingtip")?Math.pow(1.25,Game.dragonLevel):1)*
                (Game.Has("Dyson spheres")?1+0.07*Game.Objects.Prism.amount:1);
        }
        if ((what=='Prism')&&Game.Has("Dyson spheres")) return (1+0.007*Game.Objects.Shipment.amount);
        return 1;
    }

    eval('Game.ClickSpecialPic='+Game.ClickSpecialPic.toString()
        .replace(`['Dragon scale','Dragon claw','Dragon fang','Dragon teddy bear'];`,
            `['Dragon scale','Dragon claw','Dragon fang','Dragon teddy bear','Dragon wingtip'];`
        ));
    

    // PRESTIGE (written through the magic of "hope for the best" maths)
    Game.lastHcFactor=3;
    Game.HcFactorFunc=function(cookies) {
        var m=cookies/1000000000000;
        if (m<=1) return 3;

        var maxHcFactor=3.45;
        if(Game.Has('Heavenly favors')) maxHcFactor=3.4;
        if(Game.Has('Divine bribes')) maxHcFactor=3.3;

        Game.lastHcFactor=Math.min(3+Math.log10(m)*(1/45), maxHcFactor);
        return Game.lastHcFactor;
    }

    Game.HowMuchPrestige=function(cookies) {
		return Math.pow(cookies/1000000000000,1/Game.HcFactorFunc(cookies));
	}
	Game.HowManyCookiesReset=function(chips) {
		return Math.pow(chips,Game.lastHcFactor)*1000000000000;
	}

    en.ue.addUpgrade("Heavenly favors", "You <b>earn prestige faster.</b>"
        +'<q>Now that you\'ve come along so far in your journey, the heavenly spirits can\'t help it to give you a little extra push.</q>',
        9000000000000, [20,7], 274, {pool: 'prestige', posX: 190, posY: -1320, parents: 
            [Game.Upgrades['Chimera']]}
    );

    en.ue.addUpgrade("Divine bribes", "You <b>earn prestige faster.</b>"
        +'<q>A little bribe goes a long way.</q>',
        900000000000000, [10,35], 274, {pool: 'prestige', posX: 190, posY: -1530, huParents: 
            ['Heavenly favors']}
    );

    /* used eval here because it's a little cleaner */

    eval('Game.Ascend='+Game.Ascend.toString().replace('if (!bypass)',`if (!Game.Has('Legacy')&&!Game.Has('Heavenly key')) return;\n\tif (!bypass)`));
    eval('Game.Logic='+Game.Logic.toString().replace(
        'if (ascendNowToGet<1) str+=loc("Ascending now would grant you no prestige.");',
        `if (!Game.Has('Legacy')&&!Game.Has('Heavenly key')) str+="You cannot ascend yet, as you do not have the Heavenly key upgrade."`
        +'\n\telse if (ascendNowToGet<1) str+=loc("Ascending now would grant you no prestige.");'
    ))

    // IDLING
    eval('Game.LoadSave='+Game.LoadSave.toString()
        .replaceAll('percent+=10;','percent+=20;')
        .replace('percent=5;','percent=10;')
        .replace('percent+=5;','')
        .replace('percent+=3;','percent+=43;')
        .replace('percent+=7;','percent+=27;')
        .replace('percent+=1;',`percent+=10;\n\t\t\t\t\t\tif(Game.Has('Chimera')) percent*=1.3;`))
    
    var desc=function(percent,total){return loc("You gain another <b>+%1%</b> of your regular CpS while the game is closed, for a total of <b>%2%</b>.",[percent,total]);}

    en.ue.replaceDescPart(Game.Upgrades['Twin Gates of Transcendence'],
        loc("You now <b>keep making cookies while the game is closed</b>, at the rate of <b>%1%</b> of your regular CpS and up to <b>1 hour</b> after the game is closed."+
            "<br>(Beyond 1 hour, this is reduced by a further %2% - your rate goes down to <b>%3%</b> of your CpS.)",[10,90,1]));
    
    en.ue.strReplace(Game.Upgrades['Angels'],desc(10,15),desc(20,30));
    en.ue.strReplace(Game.Upgrades['Archangels'],desc(10,25),desc(20,50));
    en.ue.strReplace(Game.Upgrades['Virtues'],desc(10,35),desc(20,70));
    en.ue.strReplace(Game.Upgrades['Dominions'],desc(10,45),desc(20,90));
    en.ue.strReplace(Game.Upgrades['Cherubim'],desc(10,55),desc(20,110));
    en.ue.strReplace(Game.Upgrades['Seraphim'],desc(10,65),desc(20,130));
    en.ue.strReplace(Game.Upgrades['God'],desc(10,75),desc(20,150));
    en.ue.strReplace(Game.Upgrades['Ichor syrup'],
        loc("You gain another <b>+%1%</b> of your regular CpS while the game is closed.",7),
        loc("You gain another <b>+%1%</b> of your regular CpS while the game is closed.",27));
    en.ue.strReplace(Game.Upgrades['Fern tea'],
        loc("You gain another <b>+%1%</b> of your regular CpS while the game is closed.",3),
        loc("You gain another <b>+%1%</b> of your regular CpS while the game is closed.",43));
    en.ue.strReplace(Game.Upgrades['Fortune #102'],
        loc("You gain another <b>+%1%</b> of your regular CpS while the game is closed.",1),
        loc("You gain another <b>+%1%</b> of your regular CpS while the game is closed.",10));
    en.ue.strReplace(Game.Upgrades['Chimera'],
        loc("You gain another <b>+%1%</b> of your regular CpS while the game is closed.",5),
        "Offline CpS gains <b>+30%</b>.");

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

    Game.Upgrades['Heavenly key'].basePrice=11111111111111111111;
    en.ue.replaceDesc(Game.Upgrades['Heavenly key'], "You can <b>ascend</b> to a higher plane of existence, leaving behind your cookies."
        +'<br>Ascend by pressing Legacy.'
        +'<q>This is the key to the pearly (and tasty) gates of pastry heaven.<br>May you use it wisely.</q>'
    )

    Game.registerHook('logic', function() {
        if (Game.T%(Game.fps)==0) General.updateSanta();
        if (Game.T%(Game.fps*30)==0) General.updateSanta_D();
        General.timeSinceLast++;

        if (!Game.Has('Legacy')) {
            if (Game.cookiesEarned>=1e18) Game.Unlock('Heavenly key');
        } else {
            Game.Upgrades['Heavenly key'].basePrice=1111111111;
            Game.Upgrades['Heavenly key'].ddesc=
                loc("Unlocks <b>%1%</b> of the potential of your prestige level.",100)+
                '<q>This is the key to the pearly (and tasty) gates of pastry heaven, granting you access to your entire stockpile of heavenly chips for baking purposes.'+
                '<br>May you use them wisely.</q>'
        }
    });
}
export { General }