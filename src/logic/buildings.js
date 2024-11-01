var BModify = {}

BModify._Initialize = function(en) {
    this.en = en;
    //Game.UpdateMenu = en.injectCode(Game.UpdateMenu, "(dropMult!=1", `'<div class="listing"><b>'+loc("Missed golden cookies:")+'</b> '+Beautify(Game.missedGoldenClicks)+'</div>' + `, "before")
    this.rsManagers = [];

    BModify.RS_Manager = function(id, baseYield, baseRS) {
        this.id = id;

        //this.baseYield = baseYield;
        this.yield = baseYield;

        this.baseRhpS = 1; // resource harvest rate
        this.RhpS = 1;

        this.baseRs = baseRS;
        this.rsTotal = baseRS;
        this.rsUsed = 0;
        this.rsAvailable = baseRS;

        this.depleted = false;
        this.statsView = false;

        this.me = Game.ObjectsById[this.id];
        this.me.rsManager = this;

        BModify.rsManagers.push(this);

        this.getBaseCpS = function() {
            cps = this.RhpS * this.yield * Game.ObjectsById[this.id].amount;
            var dmult = 1;
            if (this.depleted)
                dmult = 0;
            return cps;
        }

        // called once every calculateGains()
        this.recalculate = function() {
            var me = this.me;
            var rhpsmult=1;
            var rsmult=1;
            for (var i in me.tieredUpgrades) {
                if (!Game.Tiers[me.tieredUpgrades[i].tier].special && Game.Has(me.tieredUpgrades[i].name)) {
                    var tierMult=2; 
                    var tierRsMult=1.5;
                    if (Game.ascensionMode!=1 && Game.Has(me.unshackleUpgrade) && Game.Has(Game.Tiers[me.tieredUpgrades[i].tier].unshackleUpgrade)) {
                        tierMult+=me.id==1?0.5:(20-me.id)*0.1;
                        tierRsMult+=me.id==1?0.25:(20-me.id)*0.05;
                    }
                    rhpsmult*=tierMult;
                    rsmult*=tierRsMult;
                }
            }
            this.RhpS = this.baseRhpS * rhpsmult;
            this.rsTotal = this.baseRs * rsmult;
            this.rsAvailable = this.rsTotal - this.rsUsed;
        }

        // called once per Game.Logic loop
        this.harvest = function() {
            this.rsUsed += (this.RhpS / Game.fps);
            this.rsAvailable = this.rsTotal - this.rsUsed;
            if (this.rsAvailable <= 0)
                this.depleted = true;
            else
                this.depleted = false;
        }

        l("productMinigameButton"+this.id).insertAdjacentHTML('afterend', 
            '<div id="productStatsButton'+this.id+'" class="productButton" onclick="Game.ObjectsById['+this.id+'].rsManager.switchStats(-1)">View Stats</div>');
        
        this.getButton = function() { return l("productStatsButton"+this.id); }

        this.switchStats = function(on) {
            if (on == -1) on = !this.statsView;
            this.statsView = on;
            if (this.statsView) {
                this.me.switchMinigame(false);
                this.getButton().textContent = loc("Close Stats");
            } else this.getButton().textContent = loc("View Stats");
        }   
        
        BModify.en.injectCode(Game.DrawBuildings, '&& !me.onMinigame ', '&& !me.rsManager.statsView', "after");

        this.logic = function() {
            if (this.statsView && this.me.onMinigame) {
                this.switchStats(false);
            }
        }
    }

    BModify.RS_Manager.prototype.getType = function () {
        return 'RS_Manager';
    }

    BModify.Recalculate = function() { this.rsManagers.forEach(mn => mn.recalculate()) }
    BModify.Harvest = function() { this.rsManagers.forEach(mn => mn.harvest()) }
    BModify.Logic = function() {
        //this.Harvest();
        this.rsManagers.forEach(mn => mn.logic())
    }

    //this.en.injectCode(Game.CalculateGains, "var mult=1;", "mod.bModify.Recalculate();", "after");
    Game.registerHook('cps', function(cps) {
        BModify.Recalculate();
        return cps;
    })
    //Game.registerHook('logic', this.Logic);

    // testing, for farms, mines
    new BModify.RS_Manager(2, 8, 40000);
    new BModify.RS_Manager(3, 47, 150000);
}



export { BModify }