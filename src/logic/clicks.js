var Clicks = {}

Clicks._Initialize = function(en, Research) {
    this.en = en;
    en.ue.setBatch('clUp');
    en.ae.setBatch('clAc');

    en.ue.addUpgrade("Big clicks", "The mouse is <b>four times</b> as efficient and the cursors are <b>twice</b> as efficient. Maximum click space <b>doubled</b>.<q>Big clicks for the big cookie.</q>",
        1000, [1, 6], 140, {unlockAt: 30, buyFunction: function(){Clicks.recalculate();Clicks.clicks=Clicks.maxClicks;}, priceFunc: function(me){return me.basePrice*(Game.HasAchiev('Hyperclick')?0.05:1);}});
    en.ue.addUpgrade("Butterfly", "The mouse is <b>four times</b> as efficient and the cursors are <b>twice</b> as efficient. Maximum click space <b>doubled</b>.<q>More like a hummingbird with THAT speed.</q>",
        100000, [12, 1], 140, {unlockAt: 3000, buyFunction: function(){Clicks.recalculate();Clicks.clicks=Clicks.maxClicks;}, priceFunc: function(me){return me.basePrice*(Game.HasAchiev('Hyperclick')?0.05:1);}});
    en.ue.addUpgrade("Hands-off approach", "Clicks regenerate <b>twice</b> as fast.<q>Ow, my hands are really sore. Good idea.</q>",
        5000000, [12, 2], 140, {unlockAt: 1000000});

    en.ae.addAchievement("Hyperclick", "Click <b>5,000</b> times in one ascension."+'<div class=\"line\"></div>Owning this achievement makes Big clicks and Butterfly <b>20 times</b> cheaper permanently.',
        [0, 0], "Just wrong", {});

    // en.ae.replaceDesc(Game.Achievements['Clickathlon'], loc("Make <b>%1</b> from clicking.",loc("%1 cookie",LBeautify(1e5)))+
    //     '<div class=\"line\"></div>Owning this achievement makes Big clicks and Butterfly <b>20 times cheaper</b> permanently.');
    
    Game.mouseCps = en.injectCode(Game.mouseCps, "Game.Has('Ambidextrous')", "+2*Game.Has('Big clicks')+2*Game.Has('Butterfly')", "after");
    Game.mouseCps = en.injectCode(Game.mouseCps, "if (Game.Has('Dragon claw')) mult*=1.03;", 
        "\n\t\t\tif(mod.research.Has('Malevolent power')) mult*=(1+0.1*mod.clicks.getOverflow())*(Game.Has('Ethereal mouse')?1.5:1);", "after");
    Game.Objects.Cursor.cps = en.injectCode(Game.Objects.Cursor.cps, "Game.Has('Ambidextrous')", "+Game.Has('Big clicks')+Game.Has('Butterfly')", "after");
    
    // why does this not work :(
    eval("Game.DrawBackground="+Game.DrawBackground.toString().replace("var alphaMult=1;",
        "var alphaMult=(0.1+0.9*(mod.clicks.clicks/mod.clicks.maxClicks))*(Game.hasBuff('Power poked')?3:1);")); 
    
    this.maxClicks = P.baseClicks;
    this.clicks = P.baseClicks;
    this.regenTimer = P.baseRegen;

    
    const minOverflow = -(10*P.overflowGain);
    this.overflow = minOverflow;
    this.overflow_enabled = false;

    this.cursorTimer = P.cursorRate;
    this.lastClickT = 0;

    this.powerClicks = 0;
    this.nextPowerClick = Game.fps*10*60;
    this.pcCooldown = 0;
    this.pcPerformed = 0;
    this.pcEnabled = false;
    this.canPowerClick = false;

    en.trackVars(Clicks, [['clicks'],['maxClicks'],['overflow','float'],['powerClicks'],['pcPerformed'],['pcEnabled']]);

    this.pcWidgetId=en.createLeftWidget([48,16],[3,0,Icons],'mod.clicks.pcTooltip','');
    this.switchId=en.createLeftWidget([144,16],[20,10],'mod.clicks.pcSwitchTooltip','mod.clicks.switchClick(-1);');
    //this.gate=en.createLeftWidget([240,16],[15,11],'mod.bModify.gateTooltip','mod.bModify.gate();');
    l('widget0').innerHTML+='<span id="pcInfo" style="position:absolute;top:-32px;left:12px;font-family:\'Merriweather\';font-size:20px;color:#fddfe8;">0/0</span>';

    Research.appendStat('<div class="subsection"><div id="clickStats"></div></div>');

    Clicks.miceUpgrades=[];

    Clicks.recalculate = function() {
        var maxClicks = P.baseClicks;
        if (Game.Has("Big clicks")) maxClicks*=2;
        if (Game.Has("Butterfly")) maxClicks*=2;
        if (Game.Has("Divine wisdom")) maxClicks+=(Game.Has("Omnipotent mouse")?15:10)*this.getMaxPowerClicks();
        //if (Game.Has("Celestial powers")) maxClicks*=1.2;
        this.miceUpgrades.forEach((upgrade) => {
            maxClicks+=Game.Has(upgrade)*24;
        })
        this.maxClicks = Math.round(maxClicks);
    }

    //cheap
    eval('Game.CalculateGains='+Game.CalculateGains.toString().replace('Game.cookiesPs=0;','mod.clicks.recalculate();Game.cookiesPs=0;'));

    function addExtClicks(name) {
        Clicks.miceUpgrades.push(name);
        en.ue.appendToDesc(Game.Upgrades[name], "<br>Maximum clicks <b>+24</b>.");
    }

    addExtClicks('Plastic mouse');
    addExtClicks('Iron mouse');
    addExtClicks('Titanium mouse');
    addExtClicks('Adamantium mouse');
    addExtClicks('Unobtainium mouse');
    addExtClicks('Eludium mouse');
    addExtClicks('Wishalloy mouse');
    addExtClicks('Fantasteel mouse');
    addExtClicks('Nevercrack mouse');
    addExtClicks('Armythril mouse');
    addExtClicks('Technobsidian mouse');
    addExtClicks('Plasmarble mouse');
    addExtClicks('Miraculite mouse');
    addExtClicks('Aetherice mouse');
    addExtClicks('Omniplast mouse');

    Clicks.getOverflow = function() {return Math.floor(Math.max(this.overflow,0));}

    Clicks.drainClick = function(now) {
        var overflowEff=1;
        if (Research.Has("Damage control")) overflowEff*=0.8;
        if (Research.Has("Temporal stretch")) overflowEff*=0.8;
        if (Research.Has("Fractal absorption")) overflowEff*=0.8;
        // hidden feature now
        if (Game.Has("Omnipotent mouse") && Game.hasBuff("Celestial energy")) overflowEff*=0.8;
        var clickNum=1+(this.overflow>0?Math.floor(this.overflow*overflowEff):0); 
        if (Game.hasBuff("Click frenzy")) clickNum*=4;
        if (Game.hasBuff("Dragonflight")) clickNum*=6;
        var godLvl=Game.hasGod('ruin');
        var gz = Game.hasBuff("Devastation");
        if (gz) {
            if (godLvl==1) clickNum+=gz.arg1*0.006;
            else if (godLvl==2) clickNum+=gz.arg1*0.003;
            else if (godLvl==3) clickNum+=gz.arg1*0.0015;
        }
        if (Game.hasBuff("Celestial energy")) clickNum*=0.4;

        this.clicks-=Math.ceil(clickNum);
        if(this.clicks<0) this.clicks=0;
        this.regenTimer=P.baseRecovery;
        if(!this.overflow_enabled) return;
        var threshold=P.baseThreshold;
        if (Game.Has("Thousand fingers")) threshold*=(1+0.1*Math.floor(Game.Objects['Cursor'].amount/100)); // cursor nerf!
        if (now-Game.lastClick<=(1000*threshold)) this.overflow+=P.overflowGain*(Research.Has("Sustainable clicks")?0.75:1);
        this.overflow=Math.min(this.overflow,P.maxOverflow);

        this.lastClickT=0;
        if (Research.Has("Malevolent power")) Game.recalculateGains = 1;
    }

    Clicks.getCursorClicks = function() { // cursor nerf!
        var clickNum=0.1*Math.ceil(Game.Objects['Cursor'].amount/100);
        if (Game.Has("Thousand fingers")) clickNum*=1.2;
        if (Game.Has("Million fingers")) clickNum*=1.2;
        if (Game.Has("Billion fingers")) clickNum*=1.2;
        if (Game.Has("Trillion fingers")) clickNum*=1.2;
        if (Game.Has("Quadrillion fingers")) clickNum*=1.2;
        if (Game.Has("Quintillion fingers")) clickNum*=1.2;
        if (Game.Has("Sextillion fingers")) clickNum*=1.2;
        if (Game.Has("Septillion fingers")) clickNum*=1.2;
        if (Game.Has("Octillion fingers")) clickNum*=1.2;
        if (Game.Has("Nonillion fingers")) clickNum*=1.2;
        if (Game.Has("Decillion fingers")) clickNum*=1.2;
        if (Game.Has("Undecillion fingers")) clickNum*=1.2;
        return clickNum;
    }

    Clicks.hasClicksLeft = function() {
        return (this.clicks > 0);
    }

    Clicks.logic = function() {
        if (this.regenTimer>0) this.regenTimer--;
        else {
            // regenerate a click
            this.clicks++;
            this.clicks=Math.min(this.clicks, this.maxClicks);
            var rate=P.baseRegen;
            if (Game.Has("Hands-off approach")) rate/=2;
            if (Research.Has("Patience")) rate/=1.3;
            if (Game.Has("Mystical regeneration")) rate/=Math.pow((Game.Has('Omnipotent mouse')?1.02:1.015),this.powerClicks);
            this.regenTimer=rate;
        }

        
        if (Game.cookieClicks>5000) Game.Win("Hyperclick");

        if (this.cursorTimer>0) this.cursorTimer--;
        else {
            if(this.lastClickT<Game.fps*60) this.clicks-=Math.ceil(this.getCursorClicks()); 
            if(this.clicks<0) this.clicks=0;
            this.cursorTimer=P.cursorRate;
        }

        if (Game.cookiesEarned>1000000) this.overflow_enabled = true;

        this.lastClickT++;
        if (this.lastClickT>=Game.fps*60) {
            this.overflow-=1/((1+3*Math.max(this.overflow,0))*Game.fps*45);
            if (this.overflow<minOverflow) this.overflow=minOverflow;
        }

        if (!(Game.drawT%5)) {
            if (Game.Has("Power clicks")) {l('wrapper0').style.display='block';l('wrapper1').style.display='block';}
            else {l('wrapper0').style.display='none';l('wrapper1').style.display='none';}
            l('pcInfo').innerHTML=this.powerClicks+'/'+this.getMaxPowerClicks();

            if (this.canPowerClickFunc() != this.canPowerClick) {
                this.canPowerClick = this.canPowerClickFunc();
                if (this.canPowerClick) l('widget'+this.switchId).classList.add('enabled');
                else l('widget'+this.switchId).classList.remove('enabled');
            }
        }

        if (this.clicks==this.maxClicks && Game.Has("Power clicks")) {
            if (this.nextPowerClick>0) this.nextPowerClick--;
            else {
                this.powerClicks++;
                this.powerClicks=Math.min(this.powerClicks, this.maxClicks);
                this.nextPowerClick=this.accumulationTime()*Game.fps*60;
            }
        }

        if (Game.hasBuff("Dragon's Eye")) this.clicks=0; // boom!
        this.pcCooldown--;
    }

    function tCost(tier){return Math.pow(110,tier);}
    const pcOrder=254;

    // power clicks
    en.ue.addUpgrade("Power clicks", "Unlocks <b>power clicks</b>."
        +'<div class="line"></div>You gain power clicks with full click capacity, up to a maximum capacity of <b>10</b>.'
        +'<div class="line"></div>Power click production is at a rate of 1 power click every 5 minutes.'
        +'<div class="line"></div>When power clicks are enabled, clicks on the big cookie are boosted by <b>x2</b> and use up a power click.'
        +'<div class="line"></div>Power clicks have a cooldown of <b>0.5</b> seconds.'
        +'<q>There\'s plenty of knowledgeable people up here, and you\'ve been given some excellent pointers.</q>',
        tCost(1), [3,0,Icons], pcOrder, {pool: 'prestige', posX: -630, posY: -480, huParents: 
            ['Starter kit']}
    );

    en.ue.addUpgrade("Heavenly clicks", "Power click capacity <b>10 &rarr; 15</b>.<br>Base click power boost from power clicks <b>x2 &rarr; x3</b>."
        +"<br>Power clicks are <b>5%</b> more powerful per stored power click."
        +'<q>Absolutely glowing.</q>',
        tCost(2), [11,35], pcOrder, {pool: 'prestige', posX: -630 - 160, posY: -480 - 115, huParents: 
            ['Power clicks']}
    );

    en.ue.addUpgrade("Divine wisdom", "You gain <b>+10</b> click storage per power click storage (refers to maximum amount of power clicks)."
        +'<br>Power click cooldown <b>0.5s &rarr; 0.45s</b>.'
        +'<q>Divine Wisdom 1: Don\'t accidentally delete your save file.</q>',
        tCost(2), [11,35], pcOrder, {pool: 'prestige', posX: -630 - 40, posY: -480 - 215, huParents: 
            ['Power clicks']}
    );

    en.ue.addUpgrade("Ethereal mouse", "Power click capacity <b>15 &rarr; 21</b>.<br>Base click power boost from power clicks <b>x3 &rarr; x4</b>."
        +"<br>Click power boost from Malevolent power <b>+50%</b>."
        +'<q>Slightly transparent.</q>',
        tCost(3), [4,1,Icons], pcOrder, {pool: 'prestige', posX: -630 - 160*2, posY: -480 - 115*2, huParents: 
            ['Heavenly clicks']}
    );

    en.ue.addUpgrade("Mystical regeneration", "Clicks regenerate <b>1.5%</b> faster (multiplicative) per stored power click."
        +'<br>Power click cooldown <b>0.45s &rarr; 0.4s</b>.'
        +'<q>Fixing! Healing!</q>',
        tCost(3), [4,1,Icons], pcOrder, {pool: 'prestige', posX: -630 - 40*2, posY: -480 - 215*2, huParents: 
            ['Divine wisdom']}
    );

    en.ue.addUpgrade("Ultra-adrenaline", "Power click capacity <b>21 &rarr; 28</b>.<br>Base click power boost from power clicks <b>x4 &rarr; x5</b>."
        +"<br>You can perform power clicks during Dragonflight and Click frenzy, albeit with reduced strength."
        +'<q>It\'s hard to describe, but you could say it\'s like feeling a fight-or-flight response every waking minute of your life.</q>',
        tCost(4), [4,2,Icons], pcOrder, {pool: 'prestige', posX: -630 - 160*3, posY: -480 - 115*3, huParents: 
            ['Ethereal mouse']}
    );

    en.ue.addUpgrade("Celestial powers", "Power clicking the big cookie <b>consumes no clicks</b> and temporarily <b>massively decreases click consumption</b>."
        +'<br>Power click cooldown <b>0.4s &rarr; 0.35s</b>.'
        //+'<br><b>+20%</b> click capacity.'
        +'<q>Essentially makes you a demi-god.</q>',
        tCost(4), [4,2,Icons], pcOrder, {pool: 'prestige', posX: -630 - 40*3, posY: -480 - 215*3, huParents: 
            ['Mystical regeneration']}
    );

    en.ue.addUpgrade("Flare cursor", "Using a power click grants a <b>+77%</b> CpS boost for <b>25 seconds</b> (duration stacks). "
        +"<br>Power clicks accumulate <b>90 seconds</b> faster."
        +'<q>Burns brighter than the sun.</q>',
        111111, [11,13], pcOrder, {pool: 'prestige', posX: -630 - 200, posY: -480 - 330, huParents: 
            ['Power clicks', 'Heavenly clicks', 'Divine wisdom']}
    );

    en.ue.addUpgrade("Omnipotent mouse", "<ul><li>&bull; Power click capacity <b>28 &rarr; 36</b>.</li>"
        +"<li>&bull; The Celestial energy buff also makes overflow accumulate slower.</li>"
        +'<li>&bull; Power click cooldown <b>0.35s &rarr; 0.3s</b>.</li>'
        +'<li>&bull; Boosts the special effects of Divine wisdom and Mystical regeneration.</li>'
        +'<li>&bull; Power clicks accumulate <b>30 seconds</b> faster.</li></ul>'
        +'<q>This is the most powerful mouse ever to grace the world. It was made in the greatest forges of heaven. Please, we beg of you, use it wisely.',
        tCost(5), [12,0], pcOrder, {pool: 'prestige', posX: -630 - 330, posY: -480 - 550, huParents:
            ['Flare cursor', 'Celestial powers', 'Ultra-adrenaline']}
    )

    en.ae.addAchievement("Power click", "Perform a <b>power click</b>.", [3,0,Icons], 'Eldeer', {});
    en.ae.addAchievement("Clickstack", "Perform a power click under a <b>Click frenzy or Dragonflight</b>.<q>A bit weak, for sure, but fine.</q>",
        [3,0,Icons], 'Eldeer', {});
    en.ae.addAchievement("Purifying forces", "Shatter the <b>Dragon's Eye</b> by performing a power click."+
                         "<div class=\"line\"></div>Doing so may summon a golden cookie that gives <b>Dragonflight</b>.",
        [3,0,Icons], 'Eldeer', {});

    //-516,-890

    new Game.buffType('power poked',function(time,pow)
		{
			return {
				name:'Power poked',
				desc:"CpS +"+(pow-1)*100+"% for "+Game.sayTime(time*Game.fps,-1)+"!",
				icon:[19,7],
				time:time*Game.fps,
				power:pow,
                add:true,
                aura:1
			};
		});

    new Game.buffType('celestial energy',function(time,pow)
		{
			return {
				name:'Celestial energy',
				desc:"Click consumption -70% for "+Game.sayTime(time*Game.fps,-1)+"!",
				icon:[19,7],
				time:time*Game.fps,
				power:pow,
                add:true,
                aura:1
			};
		});

    en.ue.addUpgrade("Enchanted sleighs", "You can <b>perform power clicks on reindeer</b>, making them give <b>five times</b> more cookies."
        +'<q>Enchanted with heartfelt love, Christmas presents, and pure unadulterated power.</q>',
        5555555, [12,9], pcOrder, {pool: 'prestige', posX: -726, posY: -412, huParents: ['Starsnow', 'Ethereal mouse']}
    )

    en.ue.addUpgrade("Time-warping mice", "Performing power clicks on golden cookies makes effects last <b>20%</b> longer."
        +'<q>Maybe it\'s better if you use reality-warping in a more profound way than this, though?</q>',
        277777777, [10,14], pcOrder, {pool: 'prestige', posX: -946, posY: -372, huParents: ['Enchanted sleighs']}
    )

    en.ue.addUpgrade("Gold-studded mice", "Performing power clicks on golden cookies increases gains by <b>50%</b>."
        +'<q>They actually taste no better than regular mice.</q>',
        277777777, [10,14], pcOrder, {pool: 'prestige', posX: -946, posY: -452, huParents: ['Enchanted sleighs']}
    )

    
    en.ue.addUpgrade("Touch of fire", "Performing power clicks on wrinklers <b>burns</b> them, making them repeatedly take damage until they pop. <br> "
        +"Each hit gives a reward proportional to the cookies swallowed by the wrinkler <small>(divided by highest raw CpS this ascension)</small>."
        +'<q>Burn, little wrinkly disgusting bugs. Burn!</q>',
        5555555, [19,8], pcOrder, {pool: 'prestige', posX: -516, posY: -890, huParents: ['Mystical regeneration', 'Sacrilegious corruption']}
    )

    // en.ue.addUpgrade("Power gate", "You can <b>spend power clicks</b> to halt depletion.<q>Uh... Gate to what, exactly?</q>",
    //     16000000,[]
    // )

    

    eval('Game.shimmerTypes.reindeer.popFunc='+Game.shimmerTypes.reindeer.popFunc.toString().replace(`moni*=Game.eff('reindeerGain');`,
        `moni*=Game.eff('reindeerGain');\n\tmoni*=mod.clicks.performPowerClick('reindeer');`));

    eval('Game.shimmerTypes.golden.popFunc='+Game.shimmerTypes.golden.popFunc.toString().replace(`else mult*=Game.eff('wrathCookieGain');`,
        `else mult*=Game.eff('wrathCookieGain');\n\t\t\t`+
        `if (Game.isGoldenCookieEffect(choice)){effectDurMod*=mod.clicks.performPowerClick('gEff');} else {mult*=mod.clicks.performPowerClick('gGains');}`))

    Clicks.getMaxPowerClicks = function() {
        var max=10;
        if (Game.Has("Heavenly clicks")) max+=5;
        if (Game.Has("Ethereal mouse")) max+=6;
        if (Game.Has("Ultra-adrenaline")) max+=7;
        if (Game.Has("Omnipotent mouse")) max+=8;
        return max;
    }

    Clicks.accumulationTime = function() {
        return (10-Game.Has('Flare cursor')*3-Game.Has('Omnipotent mouse'))/2;
    }

    Clicks.expendPowerClick = function(func) {
        this.powerClicks--;
        this.pcCooldown=Game.fps*0.5-Game.fps*0.05*Game.Has('Divine wisdom')-Game.fps*0.05*Game.Has('Mystical regeneration')-Game.fps*0.05*Game.Has('Celestial powers');
        this.pcPerformed++;
        Game.Win('Power click');
        Game.SparkleAt(Game.mouseX,Game.mouseY);
        if (Game.Has("Flare cursor")) Game.gainBuff('power poked', 25, 1.77);
        if (Game.Has("Celestial powers")) Game.gainBuff('celestial energy', 2, 1);

        if (func=='click') {
            if (Game.hasBuff("Cursed finger")) Game.Notify("Power clicked the big cookie during a Cursed finger", "Click power massively boosted!",[12,17],6);
            else Game.Notify("Power clicked the big cookie","Click power boosted!",[3,0,Icons],6);
        }
        if (func=='reindeer') Game.Notify("Power clicked a reindeer","Cookies found quintupled!",[12,9],6);
        if (func=='gEff') Game.Notify("Power clicked a golden cookie","Effect duration increased by 20%!",[10,14],6);
        if (func=='gGains') Game.Notify("Power clicked a golden cookie","Gains increased by 50%!",[10,14],6);
        if (func=='wrinkler') Game.Notify("Burned a wrinkler", "Treasure gushes out...", [3,0,Icons],6);
    }

    Clicks.canPowerClickFunc = function() {
        if (!Game.Has("Power clicks")) return false;
        if (!this.pcEnabled) return false;
        if (this.powerClicks<=0) return false;
        if (this.pcCooldown>0) return false;
        return true;
    }

    Clicks.getDragonsEyeBoost = function() {
        Game.Win('Bonds of hatred');
        let boost = 1 + 0.015 * this.clicks;
        if (Research.Has('The all-seeing')) boost*=1.2;
        if (Game.hasBuff('Click frenzy')) {
            Game.killBuff('Click frenzy');
            boost *= 2.5;
        }
        if (Game.hasBuff('Dragonflight')) {
            Game.killBuff('Dragonflight');
            boost *= 3;
        }
        if (Game.hasBuff('Cursed finger')) {
            Game.killBuff('Cursed finger');
            boost *= 6;
        }
        if (Game.hasBuff('Wrinkled cursors')) {
            Game.killBuff('Wrinkled cursors');
            boost *= 1.2;
        }

        if (boost>=200) Game.Win('Eye of the forgotten');
        return Math.round((boost + Number.EPSILON) * 100) / 100;
    }

    Clicks.feedDragonEye = function(choice) {
        if ((choice=='click frenzy')||(choice=='dragonflight')) {
            Game.hasBuff('Dragon\'s Eye').multCpS*=1.3;
            Game.Win("The hungering eye");
            return 'fortune';
        }
        if (choice=='cursed finger') {
            Game.hasBuff('Dragon\'s Eye').multCpS*=1.8;
            Game.Win("The hungering eye");
            return 'fortune';
        }
    }

    new Game.buffType('dragon eye',function(time,pow)
        {
            return {
                name:"Dragon's Eye",
                dname:"Dragon's Eye",
                desc:"Clicks depleted for "+Game.sayTime(time*Game.fps,-1)+", but cookie production x"+pow+"!",
                icon:[3,6,Icons], // icon when
                time:time*Game.fps,
                power:pow,
                multCpS:pow,
                multClick:0, // just in case
                add:true,
                aura:1
            };
        });

    Game.dragonAuras[12].desc="Wrath cookies may trigger a <b>Dragon's Eye</b>.";
    Game.dragonLevels[15].action="Train Unholy Dominion<br><small>Aura: wrath cookies may trigger a Dragon's Eye</small>";

    eval('Game.shimmerTypes.golden.popFunc='+Game.shimmerTypes.golden.popFunc.toString()
         .replace(`if (me.wrath && Math.random()<0.1) list.push('cursed finger');`,
                  `if (me.wrath && Math.random()<0.1) list.push('cursed finger');`
                  +`\n\t\tif (me.wrath && Math.random()<0.5*Game.auraMult('Unholy Dominion')) list.push('dragon eye');`))
    Game.goldenCookieChoices.push("Dragon's Eye", "dragon eye");
    Game.shimmerTypes.golden.popFunc = en.injectCode(Game.shimmerTypes.golden.popFunc,
        "else if (choice=='clot')",
        `else if (choice=='dragon eye'){Game.gainBuff('dragon eye',Math.ceil(14*effectDurMod),mod.clicks.getDragonsEyeBoost());}\n\t\t\t`,
        "before"
    )

    // add sprite when

    // also maybe make this achievement a research upgrade?
    en.ae.addAchievement("Bonds of hatred", "Obtain the <b>Dragon's Eye</b>.<div class=\"line\"></div>"+
                         "Dragon's Eye is a buff that consumes clicks and click buffs to give a CpS buff.",
                         [3,6,Icons], 'Clickstack', {});
    en.ae.addAchievement("Eye of the forgotten", "Obtain a CpS multiplier from <b>Dragon's Eye</b> of at least <b>x200</b>.",
        [3,6,Icons], 'Clickstack', {});
    en.ae.addAchievement("The hungering eye", "Feed the <b>Dragon's Eye</b> by obtaining a click buff when it is active."
                         +"<q>It thirsts for more.</q>",
        [3,6,Icons], 'Clickstack', {});
    Clicks.burned = [];

    Clicks.WrinklerBurn = function(i) {
        var me = this;
        Clicks.burned.push(this);
        this.w = Game.wrinklers[i];
        this.T = 0;

        this.w.burning = true;
        this.loop = function() {
            me.T++;
            if (!this.w.burning) return;
            if (me.T%10 && me.w.hp>0.5) {
				me.w.hurt=1;
				me.w.hp-=0.75;
				if (Game.prefs.particles && !Game.prefs.notScary && !Game.WINKLERS && !(me.w.hp<=0.5 && me.w.phase>0)) {
					var x=me.w.x+(Math.sin(me.w.r*Math.PI/180)*90);
					var y=me.w.y+(Math.cos(me.w.r*Math.PI/180)*90);
					for (var ii=0;ii<3;ii++) {
						var part=Game.particleAdd(x,y,Math.random()*4-2,Math.random()*-2-2,1,1,2,me.w.type==1?'shinyWrinklerBits.png':'wrinklerBits.png');
						part.r=-me.w.r;
					}
				}
                // rewards
                let cookiesR = me.sucked / Math.max(Game.cookiesPsRawHighest, 1);
                let rewards = ['cookies', 'cookies'];
                if (Game.season=='christmas') rewards.push('reindeer');
                if (cookiesR > 60*60 && !Game.hasBuff('cookie storm')) rewards.push('storm', 'wh');
                if (cookiesR > 60*60*3) rewards.push('wh', 'click boost', 'gold hoard');

                if (cookiesR > 60*60*3 && Math.random() < 0.1) rewards.push('gc');
                if (cookiesR > 60*60*8 && Math.random() < 0.2) rewards.push('gc');
                if (cookiesR > 60*60*24 && Math.random() < 0.005) rewards.push('lump');
                if (cookiesR > 60*60*24*7) {
                    rewards.push('gc');
                    if (Math.random() < 0.001) rewards.push('starlight');
                }

                let popup = '';
                let reward = choose(rewards);
                if (reward == 'cookies') {
                    Game.Earn(Math.min(Game.cookies*0.3,Game.cookiesPs*cookiesR*(0.08+0.24*Math.random()))+13);
                } else if (reward == 'reindeer') {
                    popup='<br><small>'+loc("+%1!",loc("%1 cookie",LBeautify(moni)))+'</small>!';
                } else if (reward == 'storm') {
                    Game.gainBuff('cookie storm',30,7);
                } else if (reward == 'click boost') {
                    Game.gainBuff('wrinklerboost',30,1);
                }

                if (me.w.hp<=0.5) this.w.burning = false;
            }
        };
    }

    new Game.buffType('wrinklerboost',function(time,pow)
		{
			return {
				name:'Wrinkled cursors',
                desc:loc("Each click is 20% more powerful per wrinkler present for ",[Game.sayTime(time*Game.fps,-1),Game.sayTime(time*Game.fps,-1)]),
				icon:[12,14],
				time:time*Game.fps,
                add:true,
				power:pow,
                multClick:pow,
				aura:1
			};
		});
        // implement

    Clicks.WrinklerBurn.prototype.getType = function() {return 'burnedWrinkler'}

    Clicks.performPowerClick = function(func) {
        if (!this.canPowerClickFunc()) return 1;
        if (func=='click') {
            var power=2;
            if (Game.Has("Heavenly clicks")) power++;
            if (Game.Has("Ethereal mouse")) power++;
            if (Game.Has("Ultra-adrenaline")) power++;

            if (Game.Has("Heavenly clicks")) power*=(1+0.05*this.powerClicks);
            if (Game.hasBuff("Click frenzy") || Game.hasBuff("Dragonflight")) {
                if (Game.Has("Ultra-adrenaline")) {power*=0.2; Game.Win("Clickstack");}
                else return 1;
            }
            if (Game.hasBuff("Cursed finger")) {power*=20*Game.eff('click');Game.killBuff("Cursed finger");} // stolen from idle mod
            if (Game.hasBuff("Dragon's Eye")) {
                power*=25;
                Game.killBuff("Dragon's Eye");
                if (Math.random()<0.1) {
                    let shim=new Game.shimmer('golden',{noWrath:true});
                    shim.force='dragonflight';
                }
            }

            this.expendPowerClick(func);
            return power;
        } else if (func=='reindeer' && Game.Has("Enchanted sleighs")) {
            this.expendPowerClick(func);
            return 5;
        } else if (func=='gEff' && Game.Has("Time-warping mice")) {
            this.expendPowerClick(func);
            return 1.2;
        } else if (func=='gGains' && Game.Has("Gold-studded mice")) {
            this.expendPowerClick(func);
            return 1.5;
        } else if (func.includes('wrinkler') && Game.Has("Touch of fire")) {
            if (!Game.wrinklers[func.replace('wrinkler', '')].burning) new this.WrinklerBurn(func.replace('wrinkler', ''));
            this.expendPowerClick(func);
        }
        return 1;
    }

    eval("Game.UpdateWrinklers="+Game.UpdateWrinklers.toString().replace('me.clicks++;','mod.clicks.performPowerClick("wrinkler"+i);me.clicks++;'));
    eval("Game.SpawnWrinkler="+Game.SpawnWrinkler.toString().replace('me.type=0;','me.type=0;me.cps=Game.cookiesPsRawHighest;'));

    Clicks.pcTooltip = function() {
        return '<div class="prompt" style="min-width:200px;text-align:center;font-size:11px;margin:8px 0px;" id="tooltipBuff"><h3>Power clicks</h3>'
        +'<div class="line"></div>'+'You have '+this.powerClicks+' power clicks (out of '+this.getMaxPowerClicks()+').<br>'
        +(this.clicks<this.maxClicks?'You are not currently accumulating power clicks.':
            'You are currently accumulating power clicks at a rate of one power click every '+this.accumulationTime()+' minutes.')+'</div>';
    }

    Clicks.pcSwitchTooltip = function() {
        return '<div class="prompt" style="min-width:200px;text-align:center;font-size:11px;margin:8px 0px;" id="tooltipBuff"><h3>Power click switch</h3>'
        +'<div class="line"></div>'+(this.pcEnabled?'Power clicks are currently enabled. Click to disable.':'Power clicks are currently disabled. Click to enable.')+'</div>';
    }

    Clicks.switchClick = function(on) {
        if (on == -1) on = !this.pcEnabled;
        this.pcEnabled = on;
        l('widget'+this.switchId).style.cssText='opacity:1;float:none;display:block;'+writeIcon([this.pcEnabled?21:20,10]);
    }


    Clicks.getClickDisplay = function() {
        return '<div class=\"line\"></div><div style="font:14px sans-serif;display:flex;align-items:center;justify-content:center;">'
        +'<div class="icon" style="transform:scale(0.9);'+writeIcon([0,0])+'"></div>'
        +'clicks left: '+this.clicks+'/'+this.maxClicks
        +(this.overflow_enabled?' (overflow: '+(this.overflow>=1?'+'+this.getOverflow():0)+')':'')+'</div>';
    }

    // show click display
    Game.Draw = en.injectCode(Game.Draw, `l('cookies').innerHTML=str;`, 
        `str=str+mod.clicks.getClickDisplay();`, 
        "before");
    
    Game.ClickCookie = en.injectCode(Game.ClickCookie, "|| Game.T<3 ", "|| !mod.clicks.hasClicksLeft() ", "after");
    Game.ClickCookie = en.injectCode(Game.ClickCookie, "Game.loseShimmeringVeil('click');", 
        "\n\t\t\t\tvar pcMult=mod.clicks.performPowerClick('click');\n\t\t\t\tif(pcMult==1||(!Game.Has('Celestial powers'))){mod.clicks.drainClick(now);}", "after");
    Game.ClickCookie = en.injectCode(Game.ClickCookie, "amount?amount:Game.computedMouseCps", 
        "(amount?amount:Game.computedMouseCps)*pcMult", "replace")
    
    Game.UpdateMenu = en.injectCode(Game.UpdateMenu,
        `'<div class="listing"><b>'+loc("Cookie clicks:")+'</b> '+Beautify(Game.cookieClicks)+'</div>'+`,
        `\n\t\t'<div class="listing"><b>Cookie clicks left:</b> '+Beautify(mod.clicks.clicks)+'</div>'+`, "after"
    )

    Game.registerHook('cps', function(cps) {
        Clicks.recalculate();
        return cps;
    })
    Game.registerHook('check', function() {
        l('clickStats').innerHTML = '<div class="listing"><div class="icon" style="float:left;background-position:'+(-0*48)+'px '+(-0*48)+'px;"></div>'+
						'<div style="margin-top:8px;"><span class="title" style="font-size:22px;">Clicks: '+Clicks.clicks+' out of '
                        +Clicks.maxClicks+'</span> '+
                        '<br>Overflow: <b>'+Clicks.getOverflow()+'</b></div>'+
					'</div>';
    })
    Game.registerHook('logic', function() {
        Clicks.logic();
        Clicks.burned.forEach((w) => w.loop());
    });
    Game.registerHook('reset', function(wipe) {
        Clicks.maxClicks = P.baseClicks+((Game.Has("Divine wisdom")&&!wipe)?(Game.Has("Omnipotent mouse")?15:10)*Clicks.getMaxPowerClicks():0);
        Clicks.clicks = Clicks.maxClicks;
        Clicks.overflow = P.minOverflow;
        Clicks.overflow_enabled = false;
        if(wipe) {Clicks.pcPerformed = false;}
        Clicks.switchClick(false);
        Clicks.powerClicks = 0;
        Clicks.nextPowerClick = Game.fps*10*60;
    })

    // en.saveCallback(function() {
    //     en.setVar("clicks", Clicks.clicks);
    //     en.setVar("maxClicks", Clicks.maxClicks);
    //     en.setVar("overflow", Clicks.overflow);
    // })

    // en.loadCallback(function() {
    //     Clicks.clicks = en.getVar("clicks", Clicks.clicks);
    //     Clicks.maxClicks = en.getVar("maxClicks", Clicks.maxClicks);
    //     Clicks.overflow = en.getVar("overflow", Clicks.overflow);
    // })
}

export { Clicks }
