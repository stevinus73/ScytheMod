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

        this.me = Game.ObjectsById[this.id];
        this.me.rsManager = this;

        BModify.rsManagers.push(this);

        this.getBaseCpS = function() {
            cps = this.RhpS * this.yield * Game.ObjectsById[this.id].amount;
            dmult = 1;
            if (this.depleted)
                dmult = 0;
            return cps;
        }

        // called once every calculateGains()
        this.recalculate = function() {
            var me = this.me;
			var rhpsmult=1;
            var rsmult=1;
			for (var i in me.tieredUpgrades)
			{
				if (!Game.Tiers[me.tieredUpgrades[i].tier].special && Game.Has(me.tieredUpgrades[i].name))
				{
					var tierMult=2;
                    var tierRsMult=1.5;
					if (Game.ascensionMode!=1 && Game.Has(me.unshackleUpgrade) && Game.Has(Game.Tiers[me.tieredUpgrades[i].tier].unshackleUpgrade))
                        tierMult+=me.id==1?0.5:(20-me.id)*0.1;
                        tireRsMult += me.id==1?0.25:(20-me.id)*0.05;
					rhpsmult*=tierMult;
                    rsmult*=tierRsMult;
				}
		    }
            this.RhpS = this.baseRhpS * rhpsmult;
            this.rsTotal = this.baseRs * rsmult;
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
    }

    BModify.RS_Manager.prototype.getType = function () {
        return 'RS_Manager';
    }

    BModify.Recalculate = function() { this.rsManagers.forEach(mn => mn.recalculate()) }
    BModify.Harvest = function() { this.rsManagers.forEach(mn => mn.harvest()) }
    

    //this.en.injectCode(Game.CalculateGains, "var mult=1;", "mod.bModify.Recalculate();", "after");
    Game.registerHook('cps', function(cps) {
        BModify.Recalculate();
        return cps;
    })
    //Game.registerHook('logic', this.Harvest);

    // testing, for farms, mines
    new BModify.RS_Manager(2, 8, 40000);
    new BModify.RS_Manager(3, 47, 150000);
}



export { BModify }