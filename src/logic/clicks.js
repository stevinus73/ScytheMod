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
    Game.Objects.Cursor.cps = en.injectCode(Game.Objects.Cursor.cps, "Game.Has('Ambidextrous')", "+2*Game.Has('Big clicks')+2*Game.Has('Butterfly')", "after");
    
    const baseClicks = 250;
    const baseRegen = Game.fps*3;
    const baseRecovery = Game.fps*15;
    this.maxClicks = baseClicks;
    this.clicks = baseClicks;
    this.regenTimer = baseRegen;

    const overflowGain = 0.5;
    const minOverflow = -(3*overflowGain);
    const overflowLoss = 0.35;
    const baseThreshold = 0.1;
    this.overflow = minOverflow;

    const baseCursorTime = Game.fps*15;
    this.cursorTimer = baseCursorTime;

    this.powerClicks = 0;
    this.maxPowerClicks = 0;
    this.pc_enabled = false;

    Clicks.recalculate = function() {
        var maxClicks = baseClicks;
        if (Game.Has("Big clicks")) maxClicks*=2;
        if (Game.Has("Butterfly")) maxClicks*=2;
        this.maxClicks = Math.round(maxClicks);
    }

    Clicks.drainClick = function(now) {
        var clickNum=1+(this.overflow>0?Math.floor(this.overflow):0); 
        this.clicks-=clickNum;
        if(this.clicks<0) this.clicks=0;
        this.regenTimer=baseRecovery;
        var threshold=baseThreshold;
        if (Game.Has("Thousand fingers")) threshold*=(1+0.2*Math.floor(Game.Objects['Cursor'].amount/100)); // cursor nerf!
        if (now-Game.lastClick<=(1000*threshold)) {
            this.overflow+=overflowGain;
        } else {
            this.overflow-=overflowLoss;
            if (this.overflow<minOverflow) this.overflow=minOverflow;
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
            var rate=baseRegen;
            if (Game.Has("Hands-off approach")) rate*=0.5;
            this.regenTimer=rate;
        }

        if (this.cursorTimer>0) this.cursorTimer--;
        else {
            this.clicks-=Math.ceil(this.getCursorClicks()); 
            if(this.clicks<0) this.clicks=0;
            this.overflow+=Math.min(Game.Objects['Cursor'].amount/500,0.5); // devious
            this.cursorTimer=baseCursorTime;
        }
    }

    Clicks.getClickDisplay = function() {
        return '<div style="font-size:50%">clicks left: '+this.clicks+' out of '+this.maxClicks
        +' (overflow: '+(this.overflow>0?'+'+Math.floor(this.overflow):0)+')</div>';
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
    en.rebuildBigCookieButton();
}

export { Clicks }