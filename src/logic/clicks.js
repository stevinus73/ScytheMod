var Clicks = {}

Clicks._Initialize = function(en, Research) {
    this.en = en;

    en.ue.addUpgrade("Big clicks", "The mouse and cursors are <b>four times as efficient</b>. Maximum click space <b>doubled</b>.<q>Big clicks for the big cookie.</q>",
        500, [1, 6], 140, {unlockAt: 100});
    en.ue.addUpgrade("Butterfly", "The mouse and cursors are <b>four times as efficient</b>. Maximum click space <b>doubled</b>.<q>More like a hummingbird with THAT speed.</q>",
        50000, [12, 1], 140, {unlockAt: 10000});
    en.ue.addUpgrade("Hands-off approach", "Clicks regenerate <b>twice</b> as fast.<q>Ow, my hands are really sore. Good idea.</q>",
        5000000, [12, 2], 140, {unlockAt: 1000000});
    
    Game.mouseCps = en.injectCode(Game.mouseCps, "Game.Has('Ambidextrous')", "+2*Game.Has('Big clicks')+2*Game.Has('Butterfly')+mod.research.has('Jitter-click')", "after");
    Game.mouseCps = en.injectCode(Game.mouseCps, "if (Game.Has('Dragon claw')) mult*=1.03;", 
        "\n\t\t\tif(mod.research.has('Malevolent power')) mult*=(1+0.1*mod.clicks.getOverflow());", "after");
    Game.Objects.Cursor.cps = en.injectCode(Game.Objects.Cursor.cps, "Game.Has('Ambidextrous')", "+2*Game.Has('Big clicks')+2*Game.Has('Butterfly')", "after");
    
    // why does this not work :(
    eval("Game.DrawSpecial="+Game.DrawSpecial.toString().replace("Game.LeftBackground.globalAlpha=0.75;","Game.LeftBackground.globalAlpha=1-0.25*(mod.clicks.clicks/mod.clicks.maxClicks);")); 
    

    // const baseClicks = 250;
    // const baseRegen = Game.fps*2;
    // const baseRecovery = Game.fps*10;
    this.maxClicks = P.baseClicks;
    this.clicks = P.baseClicks;
    this.regenTimer = P.baseRegen;
    en.newVar("clicks", "int");
    en.newVar("maxClicks", "int");

    // const overflowGain = 0.5;
    const minOverflow = -(3*P.overflowGain);
    // const overflowLoss = 0.35;
    // const baseThreshold = 0.2;
    this.overflow = minOverflow;
    en.newVar("overflow", "float");
    this.overflow_enabled = false;

    // const baseCursorTime = Game.fps*15;
    this.cursorTimer = P.cursorRate;

    this.powerClicks = 0;
    this.maxPowerClicks = 0;
    this.pc_enabled = false;

    Clicks.recalculate = function() {
        var maxClicks = P.baseClicks;
        if (Game.Has("Big clicks")) maxClicks*=2;
        if (Game.Has("Butterfly")) maxClicks*=2;
        this.maxClicks = Math.round(maxClicks);
    }

    Clicks.getOverflow = function() {return Math.floor(Math.max(this.overflow,0));}

    // Game.Object.prototype.sell = en.injectMult(Game.Object.prototype.sell, 
    //     [[",1+sold*0.01", ",1+sold*0.005"],[",1+sold*0.005", ",1+sold*0.003"],[",1+sold*0.0025", ",1+sold*0.001"]], "after"
    // )

    for (var i in Game.Objects) {
        var me = Game.Objects[i];
        me.sell = en.injectCode(me.sell, "sold*0.01", ",1+sold*0.005", "after")
        me.sell = en.injectCode(me.sell, "sold*0.005", ",1+sold*0.003", "after")
        me.sell = en.injectCode(me.sell, "sold*0.0025", ",1+sold*0.001", "after")
    }

    Clicks.drainClick = function(now) {
        var clickNum=1+(this.overflow>0?Math.floor(this.overflow*(Research.has("Damage control")?0.8:1)):0); 
        if (Game.hasBuff("Click frenzy")) clickNum*=2;
        if (Game.hasBuff("Dragonflight")) clickNum*=2;
        var gz = Game.hasBuff("Devastation");
        if (gz) clickNum*=(1+gz.arg2);
        this.clicks-=Math.ceil(clickNum);
        if(this.clicks<0) this.clicks=0;
        this.regenTimer=P.baseRecovery;
        if(!this.overflow_enabled) return;
        var threshold=P.baseThreshold;
        if (Game.Has("Thousand fingers")) threshold*=(1+0.1*Math.floor(Game.Objects['Cursor'].amount/100)); // cursor nerf!
        if (now-Game.lastClick<=(1000*threshold)) {
            this.overflow+=P.overflowGain*(Research.has("Sustainable clicks")?0.75:1);
            if (Research.has("Malevolent power")) Game.recalculateGains = 1;
        } else {
            this.overflow-=P.overflowLoss*(this.overflow>=1?1:2.5);
            if (this.overflow<minOverflow) this.overflow=minOverflow;
            if (Research.has("Malevolent power")) Game.recalculateGains = 1;
        }
    }

    Clicks.getCursorClicks = function() { // cursor nerf!
        var clickNum=0.1*Math.ceil(Game.Objects['Cursor'].amount/100);
        if (Game.Has("Thousand fingers")) clickNum*=1.3;
        if (Game.Has("Million fingers")) clickNum*=1.3;
        if (Game.Has("Billion fingers")) clickNum*=1.3;
        if (Game.Has("Trillion fingers")) clickNum*=1.3;
        if (Game.Has("Quadrillion fingers")) clickNum*=1.3;
        if (Game.Has("Quintillion fingers")) clickNum*=1.3;
        if (Game.Has("Sextillion fingers")) clickNum*=1.3;
        if (Game.Has("Septillion fingers")) clickNum*=1.3;
        if (Game.Has("Octillion fingers")) clickNum*=1.3;
        if (Game.Has("Nonillion fingers")) clickNum*=1.3;
        if (Game.Has("Decillion fingers")) clickNum*=1.3;
        if (Game.Has("Undecillion fingers")) clickNum*=1.3;
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
            if(this.overflow_enabled) this.overflow+=Math.min(Game.Objects['Cursor'].amount/500,0.5); // devious
            this.cursorTimer=P.cursorRate;
        }

        if (!Kaizo && (Game.cookiesEarned+Game.cookiesReset)>=P.overflowT) this.overflow_enabled = true;
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
    Game.ClickCookie = en.injectCode(Game.ClickCookie, "Game.loseShimmeringVeil('click');", "\n\t\tmod.clicks.drainClick(now);", "after");
    
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