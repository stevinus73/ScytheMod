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

    }

    Clicks.hasClicksLeft = function() {

    }

    Clicks.logic = function() {
        if (this.regenTimer>0) this.regenTimer--;
        else {

        }
    }
}

export { Clicks }