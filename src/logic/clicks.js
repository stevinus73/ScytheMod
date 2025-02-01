var Clicks = {}

Clicks._Initialize = function(en, Research) {
    this.en = en;

    en.ue.addUpgrade("Big clicks", "The mouse and cursors are <b>four times as efficient</b>. Maximum click space <b>doubled</b>.<q>Big clicks for the big cookie.</q>",
        50, [1, 6], 140, {unlockAt: 10});
    en.ue.addUpgrade("Butterfly", "The mouse and cursors are <b>four times as efficient</b>. Maximum click space <b>doubled</b>.<q>More like a hummingbird with THAT speed.</q>",
        50000, [12, 1], 140, {unlockAt: 10000});
    en.ue.addUpgrade("Hands-off approach", "Clicks regenerate <b>twice</b> as fast.<q>Ow, my hands are really sore. Good idea.</q>",
        50000000, [12, 2], 140, {unlockAt: 1000000});
    
    Game.mouseCps = en.injectCode(Game.mouseCps, "Game.Has('Ambidextrous')", "+2*Game.Has('Big clicks')+2*Game.Has('Butterfly')+mod.research.has('Jitter-click')", "after");
    Game.mouseCps = en.injectCode(Game.mouseCps, "if (Game.Has('Dragon claw')) mult*=1.03;", 
        "\n\t\t\tif(mod.research.has('Malevolent power')) mult*=(1+0.1*mod.clicks.getOverflow());", "after");
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
    this.pcEnabled = false;

    var pcWrapper=document.createElement('div');
    pcWrapper.style.cssText='position:absolute;bottom:16px;right:8px;z-index:100000;transform-origin:100% 0%;transform:scale(0.9);';
    pcWrapper.innerHTML='<div id="pcButton" class="crate heavenly" style="opacity:1;float:none;display:block;'+writeIcon([3,0,Icons])+'"></div>'
        +'<div id="pcInfo" class="description">0/0</div>';
    l('sectionLeft').appendChild(pcWrapper);
    this.pcWidget = l('pcButton');

    var swWrapper=document.createElement('div');
    swWrapper.style.cssText='position:absolute;bottom:16px;right:96px;z-index:100000;transform-origin:100% 0%;transform:scale(0.9);';
    swWrapper.innerHTML='<div id="pcSwitch" class="crate heavenly" style="opacity:1;float:none;display:block;'+writeIcon([20,10])+'"></div>';
    l('sectionLeft').appendChild(swWrapper);
    this.switch = l('pcSwitch');

    Clicks.recalculate = function() {
        var maxClicks = P.baseClicks;
        if (Game.Has("Big clicks")) maxClicks*=2;
        if (Game.Has("Butterfly")) maxClicks*=2;
        if (Game.Has("Divine wistom")) maxClicks+=10*this.getMaxPowerClicks();
        this.maxClicks = Math.round(maxClicks);
    }

    Clicks.getOverflow = function() {return Math.floor(Math.max(this.overflow,0));}

    Clicks.drainClick = function(now) {
        var overflowEff=1;
        if (Research.has("Damage control")) eff*=0.8;
        if (Research.has("Temporal stretch")) eff*=0.8;
        if (Research.has("Fractal absorption")) eff*=0.8;
        var clickNum=1+(this.overflow>0?Math.floor(this.overflow*overflowEff):0); 
        if (Game.hasBuff("Click frenzy")) clickNum*=2.3;
        if (Game.hasBuff("Dragonflight")) clickNum*=5.5;
        var gz = Game.hasBuff("Devastation");
        if (gz) clickNum*=(1+gz.arg1*0.6);

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
            if (Game.Has("Hands-off approach")) rate*=0.5;
            if (Research.has("Patience")) rate*=0.7;
            this.regenTimer=rate;
        }

        if (this.cursorTimer>0) this.cursorTimer--;
        else {
            this.clicks-=Math.ceil(this.getCursorClicks()); 
            if(this.clicks<0) this.clicks=0;
            // if(this.overflow_enabled) this.overflow+=Math.min(Game.Objects['Cursor'].amount/500,0.5); // devious
            this.cursorTimer=P.cursorRate;
        }

        this.overflow_enabled = true;

        this.lastClickT++;

        if (this.lastClickT>=Game.fps*60) {
            this.overflow-=1/((1+3*Math.max(this.overflow,0))*Game.fps*45);
            if (this.overflow<minOverflow) this.overflow=minOverflow;
        }
    }

    function tCost(tier){return 10*Math.pow(11,tier);}
    const pcOrder=254;

    // power clicks
    en.ue.addUpgrade("Power clicks", "Unlocks <b>power clicks</b>."
        +'<q>There\'s plenty of knowledgeable people up here, and you\'ve been given some excellent pointers.</q>',
        tCost(1), [3,0,Icons], pcOrder, {pool: 'prestige', posX: -630, posY: -480, huParents: 
            ['Starter kit']}
    );

    en.ue.addUpgrade("Heavenly clicks", "Max power clicks <b>10 &rarr; 15</b>. <br> Click power boost <b>x2 &rarr; x3</b>.<br>Power clicks are <b>5%</b> more powerful per stored power click."
        +'<q></q>',
        tCost(2), [3,0,Icons], pcOrder, {pool: 'prestige', posX: -630 - 240, posY: -480 - 115, huParents: 
            ['Power clicks']}
    );

    en.ue.addUpgrade("Divine wisdom", "You gain <b>+10</b> click storage per power click storage (refers to maximum amount of power clicks)."
        +'<q>Divine Wisdom 1: Don\'t accidentally delete your save file.</q>',
        tCost(2), [3,0,Icons], pcOrder, {pool: 'prestige', posX: -630 - 80, posY: -480 - 345, huParents: 
            ['Power clicks']}
    );

    en.ue.addUpgrade("Ethereal clicks", "Max power clicks <b>15 &rarr; 21</b>. <br> Click power boost <b>x3 &rarr; x4</b>."
        +'<q></q>',
        tCost(3), [3,0,Icons], pcOrder, {pool: 'prestige', posX: -630 - 240*2, posY: -480 - 115*2, huParents: 
            ['Heavenly clicks']}
    );

    Clicks.getMaxPowerClicks = function() {
        var max=10;
        if (Game.Has("Heavenly clicks")) max+=5;
        if (Game.Has("Ethereal clicks")) max+=6;
        return max;
    }

    Clicks.performPowerClick = function() {
        
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
    Game.ClickCookie = en.injectCode(Game.ClickCookie, "Game.loseShimmeringVeil('click');", "\n\t\t\t\tmod.clicks.drainClick(now);", "after");
    
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
    Game.registerHook('reset', function(wipe) {
        Clicks.clicks = P.baseClicks;
        Clicks.maxClicks = P.baseClicks;
        Clicks.overflow = P.minOverflow;
        if(wipe) Clicks.overflow_enabled = false;
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