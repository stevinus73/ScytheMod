var Clicks = {}

Clicks._Initialize = function(en, Research) {
    this.en = en;
    
    this.baseClicks = 1000;
    this.maxClicks = this.baseClicks;
    this.clicks = this.baseClicks;
    this.regenTimer = Game.fps;

    this.powerClicks = 0;
    this.maxPowerClicks = 0;
    this.pc_enabled = false;

    Clicks.recalculate = function() {

    }

    Clicks.drainClick = function() {
        this.clicks--;
        this.regenTimer=Game.fps*60;
    }

    Clicks.hasClicksLeft = function() {
        return (clicks > 0);
    }

    Clicks.logic = function() {
        if (this.regenTimer>0) this.regenTimer--;
        else {
            // regenerate a click
            this.clicks++;
            this.clicks=Math.min(this.clicks, this.maxClicks);
            this.regenTimer=Game.fps*60;
        }
    }

    // show click display
    en.injectCode(Game.Draw, `l('cookies').innerHTML=str;`, 
        `str=str+'<div style="font-size:50%">(clicks left: ')</div>;`, 
        "before");
    
    en.injectMult(Game.ClickCookie, 
        [["|| Game.T<3 ", "|| !mod.clicks.hasClicksLeft() "]
        ,["Game.loseShimmeringVeil('click');", "\n\t\tmod.clicks.drainClick();"]], "after");
    
    en.injectCode(Game.UpdateMenu,
        `'<div class="listing"><b>'+loc("Cookie clicks:")+'</b> '+Beautify(Game.cookieClicks)+'</div>'+`,
        `\n\t\t'<div class="listing"><b>Cookie clicks left:</b> '+Beautify(mod.clicks.clicks)+'</div>'+`, "after"
    )

    Game.registerHook('cps', function(cps) {
        Clicks.recalculate();
        return cps;
    })
    Game.registerHook('logic', this.logic);
}

export { Clicks }