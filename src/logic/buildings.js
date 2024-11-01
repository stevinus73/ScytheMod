var BModify = {}

BModify._Initialize = function(en) {
    this.en = en;
    //Game.UpdateMenu = en.injectCode(Game.UpdateMenu, "(dropMult!=1", `'<div class="listing"><b>'+loc("Missed golden cookies:")+'</b> '+Beautify(Game.missedGoldenClicks)+'</div>' + `, "before")
    this.rsManagers = [];

    BModify.RS_Manager = function(id, baseRS, rsNames) {
        this.id = id;
        this.me = Game.ObjectsById[this.id];
        this.me.rsManager = this;
        this.rsNames = rsNames;

        this.baseYield = this.me.baseCps;
        this.yield = this.baseYield;

        this.baseRhpS = 1; // resource harvest rate
        this.RhpS = this.baseRhpS;

        this.baseRs = baseRS;
        this.rsTotal = baseRS;
        this.rsUsed = 0;
        this.rsAvailable = baseRS;

        this.depleted = false;
        this.statsView = false;

        BModify.rsManagers.push(this);

        this.getRawCpS = function() {
            cps = this.RhpS * this.yield * this.me.amount;
            var dmult = 1;
            if (this.depleted)
                dmult = 0;
            return cps * dmult;
        }

        // called once every calculateGains()
        this.recalculate = function() {
            var me = this.me;
            var rhpsmult=1;
            var rsmult=1;
            var yieldmult=1;
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
            for (var i in me.synergies) {
                var syn=me.synergies[i];
                if (Game.Has(syn.name)) {
                    if (syn.buildingTie1.name==me.name) yieldmult*=(1+0.05*syn.buildingTie2.amount);
                    else if (syn.buildingTie2.name==me.name) yieldmult*=(1+0.001*syn.buildingTie1.amount);
                }
            }
            if (me.fortune && Game.Has(me.fortune.name)) yieldmult*=1.07;
            if (me.grandma && Game.Has(me.grandma.name)) yieldmult*=(1+Game.Objects['Grandma'].amount*0.01*(1/(me.id-1)));
            this.yield = this.baseYield * yieldmult;
            this.RhpS = this.baseRhpS * rhpsmult;
            this.rsTotal = this.baseRs * rsmult;
            this.rsAvailable = this.rsTotal - this.rsUsed;
            this.update()
        }

        // called once per Game.Logic loop
        this.harvest = function() {
            this.rsUsed += (this.RhpS / Game.fps) * this.me.amount;
            this.rsAvailable = this.rsTotal - this.rsUsed;
            if (this.rsAvailable <= 0)
                this.depleted = true;
            else
                this.depleted = false;
        }

        l("productMinigameButton"+this.id).insertAdjacentHTML('afterend', 
            '<div id="productStatsButton'+this.id+'" class="productButton" onclick="Game.ObjectsById['+this.id+'].rsManager.switchStats(-1)">View Stats</div>');
        l("row"+this.id).insertAdjacentHTML('beforeend', 
            '<div id="rowStats'+this.id+'" style="display: none" class="rowSpecial"></div>'
        )


        this.getButton = function() { return l("productStatsButton"+this.id); }
        this.getStatDiv = function() { return l("rowStats"+this.id); }

        this.getStatDiv().insertAdjacentHTML('beforeend', 
            '<div id="stats'+this.id+'" class="subsection"></div>'
        )

        l('stats'+this.id).insertAdjacentHTML('beforeend',
            '<div class="title" style="position:relative">'+this.me.dname+'s</div>'
        )

        l('stats'+this.id).insertAdjacentHTML('beforeend',
            '<div id="statsListing'+this.id+'"></div>'
        )
        
        l('statsListing'+this.id).insertAdjacentHTML('beforeend',
            '<span class="listing"> <b>'+this.rsNames[0]+' harvest rate ('+this.rsNames[2]+'/second) per '+this.me.dname+':</b> <p id="rhps'+this.id+'">0</p> (<p id="rhpst'+this.id+'">0</p> for <p id="numB'+this.id+'">0</p> '+this.me.dname+'s)</span>'
        )

        l('statsListing'+this.id).insertAdjacentHTML('beforeend',
            '<span class="listing"> <b>Yield:</b> <p id="yield'+this.id+'">0</p></span>'
        )

        l('statsListing'+this.id).insertAdjacentHTML('beforeend',
            '<span class="listing"> <b>Total amount of '+this.rsNames[0]+':</b> <p id="rsTotal'+this.id+'">0</p></span>'
        )

        l('statsListing'+this.id).insertAdjacentHTML('beforeend',
            '<span class="listing"> <b>Harvested '+this.rsNames[0]+' so far:</b> <p id="rsUsed'+this.id+'">0</p></span>'
        )

        l('statsListing'+this.id).insertAdjacentHTML('beforeend',
            '<span class="listing"> <b>Total CpS:</b> <p id="rscps'+this.id+'">0</p></span>'
        )

        this.switchStats = function(on) {
            if (on == -1) on = !this.statsView;
            this.statsView = on;
            if (this.statsView) {
                this.me.switchMinigame(false);
                l('rowSpecial'+this.id).style.display='none';
                this.getStatDiv().style.display='block';
                this.getButton().textContent = loc("Close Stats");
                l('row'+this.id).classList.add('onMinigame');
            } else {
                this.getStatDiv().style.display='none';
                this.getButton().textContent = loc("View Stats");
                l('row'+this.id).classList.remove('onMinigame');
            }
        }   
        
        Game.DrawBuildings = BModify.en.injectCode(Game.DrawBuildings, '&& !me.onMinigame ', 
            '&& (me.rsManager ? !me.rsManager.statsView : true) ', "after");

        this.logic = function() {
            if (this.statsView && this.me.onMinigame) {
                this.switchStats(false);
                l('rowSpecial'+this.id).style.display='block';
            }
        }

        this.update = function() {
            l('rhps'+this.id).textContent = LBeautify(this.RhpS);
            l('rhpst'+this.id).textContent = LBeautify(this.RhpS * this.me.amount);
            l('numB'+this.id).textContent = LBeautify(this.me.amount);
            l('yield'+this.id).textContent = LBeautify(this.yield) + " cookies/" + this.rsNames[1];
            l('rsTotal'+this.id).textContent = LBeautify(this.rsTotal) + " " + this.rsNames[2];
            l('rsUsed'+this.id).textContent = LBeautify(this.rsUsed) + " " + this.rsNames[2];
            l('rscps'+this.id).textContent = LBeautify(this.getRawCpS()) + " cookies/second";
        }
    }

    BModify.RS_Manager.prototype.getType = function () {
        return 'RS_Manager';
    }

    BModify.Recalculate = function() { this.rsManagers.forEach(mn => mn.recalculate()) }
    BModify.Harvest = function() { this.rsManagers.forEach(mn => mn.harvest()) }
    BModify.Logic = function() {
        BModify.Harvest();
        BModify.rsManagers.forEach(mn => mn.logic())
    }

    Game.registerHook('cps', function(cps) {
        BModify.Recalculate();
        return cps;
    })
    Game.registerHook('logic', this.Logic);
    Game.registerHook('check', function() {
        BModify.rsManagers.forEach(mn => mn.update())
    })





    // testing, for farms, mines
    new BModify.RS_Manager(2, 40000, ["Arable land", "acre", "acres"]);
    new BModify.RS_Manager(3, 200000, ["Cookie ore", "ton", "tons"]);
    new BModify.RS_Manager(4, 170000, ["Chocolate fuel", "liter", "liters"]);
}



export { BModify }