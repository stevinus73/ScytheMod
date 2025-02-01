var Clicks = {}

Clicks._Initialize = function(en, Research) {
    this.en = en;

    en.ue.addUpgrade("Big clicks", "The mouse and cursors are <b>four times as efficient</b>. Maximum click space <b>doubled</b>.<q>Big clicks for the big cookie.</q>",
        50, [1, 6], 140, {unlockAt: 10, buyFunction: function(){Clicks.clicks+=250;}});
    en.ue.addUpgrade("Butterfly", "The mouse and cursors are <b>four times as efficient</b>. Maximum click space <b>doubled</b>.<q>More like a hummingbird with THAT speed.</q>",
        5000, [12, 1], 140, {unlockAt: 1000, buyFunction: function(){Clicks.clicks+=500;}});
    en.ue.addUpgrade("Hands-off approach", "Clicks regenerate <b>twice</b> as fast.<q>Ow, my hands are really sore. Good idea.</q>",
        50000000, [12, 2], 140, {unlockAt: 1000000});
    
    Game.mouseCps = en.injectCode(Game.mouseCps, "Game.Has('Ambidextrous')", "+2*Game.Has('Big clicks')+2*Game.Has('Butterfly')+mod.research.has('Jitter-click')", "after");
    Game.mouseCps = en.injectCode(Game.mouseCps, "if (Game.Has('Dragon claw')) mult*=1.03;", 
        "\n\t\t\tif(mod.research.has('Malevolent power')) mult*=(1+0.1*mod.clicks.getOverflow())*(Game.Has('Ethereal mouse')?1.5:1);", "after");
    Game.Objects.Cursor.cps = en.injectCode(Game.Objects.Cursor.cps, "Game.Has('Ambidextrous')", "+2*Game.Has('Big clicks')+2*Game.Has('Butterfly')", "after");
    
    // why does this not work :(
    eval("Game.DrawBackground="+Game.DrawBackground.toString().replace("var alphaMult=1;","var alphaMult=0.1+0.9*(mod.clicks.clicks/mod.clicks.maxClicks);")); 
    
    this.maxClicks = P.baseClicks;
    this.clicks = P.baseClicks;
    this.regenTimer = P.baseRegen;
    en.newVar("clicks", "int");
    en.newVar("maxClicks", "int");

    
    const minOverflow = -(3*P.overflowGain);
    this.overflow = minOverflow;
    en.newVar("overflow", "float");
    this.overflow_enabled = false;

    this.cursorTimer = P.cursorRate;
    this.lastClickT = 0;

    this.powerClicks = 0;
    this.nextPowerClick = Game.fps*10*60;
    this.pcEnabled = false;

    var pcWrapper=document.createElement('div');
    pcWrapper.id='pcWrapper';
    pcWrapper.style.cssText='position:absolute;bottom:48px;right:16px;z-index:100000;transform-origin:100% 0%;transform:scale(0.9);';
    pcWrapper.innerHTML='<div id="pcButton" class="crate heavenly" style="opacity:1;float:none;display:block;'+writeIcon([3,0,Icons])+'" '
        +Game.getDynamicTooltip('mod.clicks.pcTooltip', 'top', true)+'></div>'
        +'<span id="pcInfo" style="position:absolute;top:-32px;left:12px;font-family:\'Merriweather\';font-size:20px;color:#fddfe8;">0/0</span>';
    l('sectionLeft').appendChild(pcWrapper);
    this.pcWidget = l('pcButton');

    var swWrapper=document.createElement('div');
    swWrapper.id='swWrapper';
    swWrapper.style.cssText='position:absolute;bottom:30px;right:108px;z-index:100000;transform-origin:100% 0%;transform:scale(0.9);';
    swWrapper.innerHTML='<div id="pcSwitch" class="crate heavenly" style="opacity:1;float:none;display:block;'+writeIcon([20,10])+'" '
        +Game.getDynamicTooltip('mod.clicks.pcSwitchTooltip', 'top', true)+' '
        +Game.clickStr+'="mod.clicks.switchClick(-1);"></div>';
    l('sectionLeft').appendChild(swWrapper);
    this.switch = l('pcSwitch');

    Clicks.recalculate = function() {
        var maxClicks = P.baseClicks;
        if (Game.Has("Big clicks")) maxClicks*=2;
        if (Game.Has("Butterfly")) maxClicks*=2;
        if (Game.Has("Divine wisdom")) maxClicks+=(Game.Has("Omnipotent mouse")?15:10)*this.getMaxPowerClicks();
        this.maxClicks = Math.round(maxClicks);
    }

    Clicks.getOverflow = function() {return Math.floor(Math.max(this.overflow,0));}

    Clicks.drainClick = function(now) {
        var overflowEff=1;
        if (Research.has("Damage control")) eff*=0.8;
        if (Research.has("Temporal stretch")) eff*=0.8;
        if (Research.has("Fractal absorption")) eff*=0.8;
        if (Game.Has("Omnipotent mouse") && Game.hasBuff("Celestial energy")) eff*=0.3;
        var clickNum=1+(this.overflow>0?Math.floor(this.overflow*overflowEff):0); 
        if (Game.hasBuff("Click frenzy")) clickNum*=2.3;
        if (Game.hasBuff("Dragonflight")) clickNum*=5.5;
        var gz = Game.hasBuff("Devastation");
        if (gz) clickNum*=(1+gz.arg1*0.6);
        if (Game.hasBuff("Celestial energy")) clickNum*=0.3;

        this.clicks-=Math.ceil(clickNum);
        if(this.clicks<0) this.clicks=0;
        this.regenTimer=P.baseRecovery;
        if(!this.overflow_enabled) return;
        var threshold=P.baseThreshold;
        if (Game.Has("Thousand fingers")) threshold*=(1+0.1*Math.floor(Game.Objects['Cursor'].amount/100)); // cursor nerf!
        if (now-Game.lastClick<=(1000*threshold)) this.overflow+=P.overflowGain*(Research.has("Sustainable clicks")?0.75:1);

        this.lastClickT=0;
        if (Research.has("Malevolent power")) Game.recalculateGains = 1;
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
            if (Research.has("Patience")) rate/=1.3;
            if (Game.Has("Mystical regeneration")) rate/=Math.pow((Game.Has('Omnipotent mouse')?1.02:1.015),this.powerClicks);
            this.regenTimer=rate;
        }

        if (this.cursorTimer>0) this.cursorTimer--;
        else {
            this.clicks-=Math.ceil(this.getCursorClicks()); 
            if(this.clicks<0) this.clicks=0;
            this.cursorTimer=P.cursorRate;
        }

        if (Game.cookiesEarned>100000) this.overflow_enabled = true;

        this.lastClickT++;

        if (this.lastClickT>=Game.fps*60) {
            this.overflow-=1/((1+3*Math.max(this.overflow,0))*Game.fps*45);
            if (this.overflow<minOverflow) this.overflow=minOverflow;
        }

        if (Game.Has("Power clicks")) {l('pcWrapper').style.display='block';l('swWrapper').style.display='block';}
        else {l('pcWrapper').style.display='none';l('swWrapper').style.display='none';}

        if (this.clicks==this.maxClicks && Game.Has("Power clicks")) {
            if (this.nextPowerClick>0) this.nextPowerClick--;
            else {
                this.powerClicks++;
                this.powerClicks=Math.min(this.powerClicks, this.maxClicks);
                this.nextPowerClick=this.accumulationTime()*Game.fps*60;
            }
        }

        l('pcInfo').innerHTML=this.powerClicks+'/'+this.getMaxPowerClicks();
    }

    function tCost(tier){return Math.pow(110,tier);}
    const pcOrder=254;

    // power clicks
    en.ue.addUpgrade("Power clicks", "Unlocks <b>power clicks</b>."
        +'<div class="line"></div>You gain power clicks with full click capacity, up to a maximum capacity of <b>10</b>.'
        +'<br>Power click production is at a rate of 1 power click every 10 minutes.'
        +'<div class="line"></div>When power clicks are enabled, clicks on the big cookie are boosted by <b>x2</b> and use up a power click.'
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
        +'<q>Essentially makes you a demi-god.</q>',
        tCost(4), [4,2,Icons], pcOrder, {pool: 'prestige', posX: -630 - 40*3, posY: -480 - 215*3, huParents: 
            ['Mystical regeneration']}
    );

    en.ue.addUpgrade("Flare cursor", "Using a power click grants a <b>+77%</b> CpS boost for <b>25 seconds</b> (duration stacks). "
        +"<br>Power clicks accumulate <b>3 minutes</b> faster."
        +'<q>Burns brighter than the sun.</q>',
        111111, [11,13], pcOrder, {pool: 'prestige', posX: -630 - 200, posY: -480 - 330, huParents: 
            ['Power clicks', 'Heavenly clicks', 'Divine wisdom']}
    );

    en.ue.addUpgrade("Omnipotent mouse", "<ul><li>Power click capacity <b>28 &rarr; 36</b>.</li>"
        +"<li>The Celestial energy buff also affects overflow.</li>"
        +'<li>Clicking is <b>25%</b> more powerful.</li>'
        +'<li>Boosts the special effects of Divine wisdom and Mystical regeneration.</li>'
        +'<li>Power clicks accumulate <b>1 minute</b> faster.</li></ul>'
        +'<q>This is the most powerful mouse you\'ve ever seen. It was made in the greatest forges of heaven. Please, we beg of you, use it wisely.',
        tCost(5), [12,0], pcOrder, {pool: 'prestige', posX: -630 - 400, posY: -480 - 660, huParents:
            ['Flare cursor', 'Celestial powers', 'Ultra-adrenaline']}
    )

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
        +'<q>Enchanted with the power of heartfelt love, Christmas presents, and pure unadulterated power.</q>',
        5555555, [12,9], pcOrder, {pool: 'prestige', posX: -726, posY: -412, huParents: ['Starsnow', 'Heavenly clicks']}
    )

    en.ue.addUpgrade("Time-warping mice", "Performing power clicks on golden cookies makes effects last <b>20%</b> longer."
        +'<q>Maybe it\'s better if you use reality-warping in a more profound way than this, though?</q>',
        277777777, [10,14], pcOrder, {pool: 'prestige', posX: -946, posY: -372, huParents: ['Enchanted sleighs']}
    )

    en.ue.addUpgrade("Gold-studded mice", "Performing power clicks on golden cookies increases gains by <b>50%</b>."
        +'<q>They actually taste no better than regular mice. Don\'t ask how I know.</q>',
        277777777, [10,14], pcOrder, {pool: 'prestige', posX: -946, posY: -452, huParents: ['Enchanted sleighs']}
    )

    

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
        return 10-(Game.Has('Flare cursor')?3:0)-(Game.Has('Omnipotent mouse')?1:0);
    }

    Clicks.expendPowerClick = function(func) {
        this.powerClicks--;
        Game.SparkleAt(Game.mouseX,Game.mouseY);
        if (Game.Has("Flare cursor")) Game.gainBuff('power poked', 25, 1.77);
        if (Game.Has("Celestial powers")) Game.gainBuff('celestial energy', 4, 1);

        if (func=='click') {
            if (Game.hasBuff("Cursed finger")) Game.Notify("Power clicked the big cookie during a Cursed finger", "Click power massively boosted!",[12,17],6);
            else Game.Notify("Power clicked the big cookie","Click power boosted!",[3,0,Icons],6);
        }
        if (func=='reindeer') Game.Notify("Power clicked a reindeer","Cookies found quintupled!",[3,0,Icons],6);
        if (func=='gEff') Game.Notify("Power clicked a golden cookie","Effect duration increased by 20%!",[3,0,Icons],6);
        if (func=='gGains') Game.Notify("Power clicked a golden cookie","Gains increased by 50%!",[3,0,Icons],6);
    }

    Clicks.performPowerClick = function(func) {
        if (!Game.Has("Power clicks")) return 1;
        if (!this.pcEnabled) return 1;
        if (this.powerClicks<=0) return 1;
        if (func=='click') {
            var power=2;
            if (Game.Has("Heavenly clicks")) power++;
            if (Game.Has("Ethereal mouse")) power++;
            if (Game.Has("Ultra-adrenaline")) power++;

            if (Game.Has("Heavenly clicks")) power*=(1+0.05*this.powerClicks);
            if (Game.hasBuff("Click frenzy") || Game.hasBuff("Dragonflight")) {if (Game.Has("Ultra-adrenaline")) power*=0.2; else return 1;}
            if (Game.hasBuff("Cursed finger")) {power*=20*Game.eff('click');Game.killBuff("Cursed finger");} // stolen from idle mod
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
        }
        return 1;
    }

    Clicks.pcTooltip = function() {
        return '<div class="prompt" style="min-width:200px;text-align:center;font-size:11px;margin:8px 0px;" id="tooltipBuff"><h3>Power clicks</h3>'
        +'<div class="line"></div>'+'You have '+this.powerClicks+' power clicks (out of '+this.getMaxPowerClicks()+').<br>'
        +(this.clicks<this.maxClicks?'You are not currently accumulating power clicks.':
            'You are currently accumulating power clicks at a rate of one power click every '+this.accumulationTime()*Game.fps*60+' minutes.')+'</div>';
    }

    Clicks.pcSwitchTooltip = function() {
        return '<div class="prompt" style="min-width:200px;text-align:center;font-size:11px;margin:8px 0px;" id="tooltipBuff"><h3>Power click switch</h3>'
        +'<div class="line"></div>'+(this.pcEnabled?'Power clicks are currently enabled. Click to disable.':'Power clicks are currently disabled. Click to enable.')+'</div>';
    }

    Clicks.switchClick = function(on) {
        if (on == -1) on = !this.pcEnabled;
        this.pcEnabled = on;
        this.switch.style.cssText='opacity:1;float:none;display:block;'+writeIcon([this.pcEnabled?21:20,10]);
    }


    Clicks.getClickDisplay = function() {
        return '<div style="font-size:50%">clicks left: '+this.clicks+' out of '+this.maxClicks
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
    Game.registerHook('logic', function() {
        Clicks.logic();
    });
    Game.registerHook('cookiesPerClick', function(cpc) {
        if (Game.Has('Omnipotent mouse')) return cpc*1.25;
        else return cpc;
    });
    Game.registerHook('reset', function(wipe) {
        Clicks.clicks = P.baseClicks;
        Clicks.maxClicks = P.baseClicks;
        Clicks.overflow = P.minOverflow;
        if(wipe) Clicks.overflow_enabled = false;
        Clicks.pc_enabled = false;
        Clicks.powerClicks = 0;
        Game.nextPowerClick = Game.fps*10*60;
    })

    en.saveCallback(function() {
        en.setVar("clicks", Clicks.clicks);
        en.setVar("maxClicks", Clicks.maxClicks);
        en.setVar("overflow", Clicks.overflow);
    })

    en.loadCallback(function() {
        Clicks.clicks = en.getVar("clicks", Clicks.clicks);
        Clicks.maxClicks = en.getVar("maxClicks", Clicks.maxClicks);
        Clicks.overflow = en.getVar("overflow", Clicks.overflow);
    })

    en.rebuildBigCookieButton();
}

export { Clicks }