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
            var cps = this.RhpS * this.yield * this.me.amount;
            var dmult = 1;
            if (this.depleted)
                dmult = 0;
            return cps * dmult;
        }

        // most important line ever
        this.me.cps = function(me) {
            return me.rsManager.getRawCpS();
        };

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
            this.rsAvailable = this.rsTotal - this.rsUsed;
            if (this.rsAvailable <= 0)
                this.depleted = true;
            else
                this.depleted = false;
            if (this.depleted) return;
            this.rsUsed += (this.RhpS / Game.fps) * this.me.amount;
        }

        l("productMinigameButton"+this.id).insertAdjacentHTML('afterend', 
            '<div id="productStatsButton'+this.id+'" class="productButton" onclick="Game.ObjectsById['+this.id+'].rsManager.switchStats(-1)">View Stats</div>');
        l("row"+this.id).insertAdjacentHTML('beforeend', 
            '<div id="rowStats'+this.id+'" style="display: none" class="rowSpecial"></div>'
        )


        this.getButton = function() { return l("productStatsButton"+this.id); }
        this.getStatDiv = function() { return l("rowStats"+this.id); }

        this.getStatDiv().insertAdjacentHTML('beforeend', '<div id="stats'+this.id+'" class="subsection"></div>')
        l('stats'+this.id).insertAdjacentHTML('beforeend', '<div class="title" style="position:relative">'+this.me.plural+'</div>')
        l('stats'+this.id).insertAdjacentHTML('beforeend', '<div id="statsListing'+this.id+'"></div>')
        l('stats'+this.id).insertAdjacentHTML('beforeend', '<div id="statsVisual'+this.id+'"></div>')

        var str = '';
        str+='<style>'
        +'#resBar'+this.id+'{max-width:95%;margin:4px auto;height:16px;}'
        +'#resBarFull'+this.id+'{transform:scale(1,2);transform-origin:50% 0;height:50%;}'
        +'</style>';
        str+='<div id="resBar'+this.id+'" class="smallFramed meterContainer" style="width:1px;">'
        str+='<div id="resBarFull'+this.id+'" class="meter filling" style="width:1px;"></div>'
        str+='</div>'
//          str+='<div id="grimoireBarText" class="titleFont"></div><div '+Game.getTooltip('<div style="padding:8px;width:300px;font-size:11px;text-align:center;">'+loc("This is your magic meter. Each spell costs magic to use.<div class=\"line\"></div>Your maximum amount of magic varies depending on your amount of <b>Wizard towers</b>, and their level.<div class=\"line\"></div>Magic refills over time. The lower your magic meter, the slower it refills.")+'</div>')+' style="position:absolute;left:0px;top:0px;right:0px;bottom:0px;"></div></div>';
        l('statsVisual'+this.id).innerHTML = str;

        this.mbarFull = l("resBarFull"+this.id);
        this.mbar = l("resBar"+this.id);

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
            str = '';
            prestigeMult = parseFloat(Game.prestige)*0.01*Game.heavenlyPower*Game.GetHeavenlyMultiplier();
            sty = this.depleted ? 'style="color:red"' : '';
            str+='<div class="listing"> <b>'+this.rsNames[0]+' harvest rate ('+this.rsNames[2]+'/second) per '+this.me.dname.toLowerCase()+': </b>'+Beautify(this.RhpS);
            str+=' ('+Beautify(this.RhpS * this.me.amount)+' for '+Beautify(this.me.amount)+' '+this.me.plural.toLowerCase()+')</div>';
            str+='<div class="listing"> <b>Yield: </b>'+Beautify(this.yield * prestigeMult)+ " cookies/"+this.rsNames[1]+'</div>';
            str+='<div class="listing"> <b>Total amount of '+this.rsNames[0].toLowerCase()+':</b> '+Beautify(this.rsTotal) + " " + this.rsNames[2]+'</div>';
            str+='<div class="listing"> <b>Harvested '+this.rsNames[0].toLowerCase()+' so far:</b> '+Beautify(this.rsUsed) + " " + this.rsNames[2]+'</div>';
            str+='<div class="listing" '+sty+'> <b>Total CpS:</b> '+Beautify(this.getRawCpS() * prestigeMult)+" cookies/second"+'</div>';
            l('statsListing'+this.id).innerHTML = str;
        }

        this.draw = function() {
	    	if (Game.drawT%5==0) {
	    		this.mbarFull.style.width=Math.round((this.rsAvailable/this.rsTotal)*100)+'%';
			    this.mbar.style.width='350px';
		    }
		    this.mbarFull.style.backgroundPosition=(-Game.T*0.5)+'px';
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
        BModify.rsManagers.forEach(mn => mn.draw())
    }

    Game.registerHook('cps', function(cps) {
        BModify.Recalculate();
        return cps;
    })
    Game.registerHook('logic', this.Logic);
    Game.registerHook('check', function() {
        BModify.rsManagers.forEach(mn => mn.update())
    })





    // vals
    new BModify.RS_Manager(2,  20000, ["Arable land", "acre", "acres"]);
    new BModify.RS_Manager(3,  75000, ["Cookie ore", "ton", "tons"]);
    new BModify.RS_Manager(4,  70000, ["Chocolate fuel", "liter", "liters"]);
    new BModify.RS_Manager(5,  66000, ["Interest", "dollar", "dollars"]);
    new BModify.RS_Manager(6,  62000, ["Artifact", "gram", "grams"]);
    new BModify.RS_Manager(7,  57000, ["Mana", "magic", "magic"]);
    new BModify.RS_Manager(8,  51000, ["Planet matter", "earth mass", "earth masses"]);
    new BModify.RS_Manager(9,  46000, ["Warped cookies", "aetheria", "aethereiars"]);
    // Alchemy labs not included because they utilize a special mechanic
    new BModify.RS_Manager(11, 43000, ["Reachable times", "century", "centuries"]);
    new BModify.RS_Manager(12, 39000, ["Antimatter", "gram", "grams"]);
    new BModify.RS_Manager(13, 38000, ["Light", "photon", "photons"]);
    // Chancemakers not included for scientific reasons
    new BModify.RS_Manager(15, 35000, ["Metafractal", "cookie", "cookies"]);
    new BModify.RS_Manager(16, 33000, ["Computational power", "operation", "operations"]);
    // Idleverses not included for the same reason as alchemy labs
    // Cortex bakers not included for similar reasons as the chancemaker
    new BModify.RS_Manager(19, 29000, ["Clone DNA", "gene", "genes"]);
}



export { BModify }