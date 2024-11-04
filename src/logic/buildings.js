import {Research} from "./research.js"
var BModify = {}

const baseRhpS_C = 1;

function cfl(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

BModify._Initialize = function(en) {
    this.en = en;
    //Game.UpdateMenu = en.injectCode(Game.UpdateMenu, "(dropMult!=1", `'<div class="listing"><b>'+loc("Missed golden cookies:")+'</b> '+Beautify(Game.missedGoldenClicks)+'</div>' + `, "before")
    this.rsManagers = [];

    BModify.RS_Manager = function(id, baseRS, rsNames) {
        this.id = id;
        this.me = Game.ObjectsById[this.id];
        this.me.rsManager = this;
        this.rsNames = rsNames;

        this.baseYield = this.me.baseCps / baseRhpS_C; // constant
        this.yield = this.baseYield;

        this.baseRhpS = baseRhpS_C; // constant
        this.RhpS = this.baseRhpS;

        this.baseRs = baseRS;
        this.rsTotal = baseRS;
        this.rsUsed = 0;
        this.rsAvailable = baseRS;

        this.depleted = false;
        this.pause = false;
        this.statsView = false;

        BModify.en.newVar("RhpS"+this.me.id,  "float");
        BModify.en.newVar("yield"+this.me.id, "float");
        BModify.en.newVar("rsTotal"+this.me.id, "int");
        BModify.en.newVar("rsUsed"+this.me.id,  "int");
        BModify.en.newVar("pause"+this.me.id,   "int");

        BModify.rsManagers.push(this);

        this.getRawCpS = function() {
            var cps = this.RhpS * this.yield * this.decayedFactor();
            var dmult = 1;
            if (this.depleted || this.pause)
                dmult = 0;
            if ((this.id == 2) && Research.has("Regrowth")) dmult = 1;
            return cps * dmult;
        }

        // overwrites vanilla cps function for building
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
                    var tierRsMult=Math.min(1.4 + 0.1 * i, 2);
                    if (Game.ascensionMode!=1 && Game.Has(me.unshackleUpgrade) && Game.Has(Game.Tiers[me.tieredUpgrades[i].tier].unshackleUpgrade)) {
                        tierMult+=me.id==1?0.5:(20-me.id)*0.1;
                        tierRsMult+=me.id==1?0.5:(20-me.id)*0.1;
                    }
                    rhpsmult*=tierMult;
                    rsmult*=tierRsMult;
                }
            }
            rsmult*=BModify.idleverse.resourceMult();
            for (var i in me.synergies) {
                var syn=me.synergies[i];
                if (Game.Has(syn.name)) {
                    if (syn.buildingTie1.name==me.name) yieldmult*=(1+0.05*syn.buildingTie2.amount);
                    else if (syn.buildingTie2.name==me.name) yieldmult*=(1+0.001*syn.buildingTie1.amount);
                }
            }
            if (me.fortune && Game.Has(me.fortune.name)) yieldmult*=1.07;
            if (me.grandma && Game.Has(me.grandma.name)) yieldmult*=(1+Game.Objects['Grandma'].amount*0.01*(1/(me.id-1)));
            if ((this.id == 2) && Research.has("Regrowth")) yieldmult*=3;

            if (me.tieredResearch) {
                if (Research.hasTiered(this.id, 1)) rsmult*=2;
                if (Research.hasTiered(this.id, 2)) rsmult*=2;
                if (Research.hasTiered(this.id, 3)) rsmult*=2;
                if (Research.hasTiered(this.id, 1)) yieldmult*=(2-0.05*this.id);
                if (Research.hasTiered(this.id, 2)) yieldmult*=(2-0.05*this.id);
                if (Research.hasTiered(this.id, 3)) yieldmult*=(2-0.05*this.id);
            }

            this.yield = this.baseYield * yieldmult;
            this.RhpS = this.baseRhpS * rhpsmult;
            this.rsTotal = this.baseRs * rsmult;
            this.rsAvailable = this.rsTotal - this.rsUsed;
            this.update()
        }
        
        // decay factor applied to rhps
        this.decayedFactor = function() {
            return this.me.amount * Math.pow(0.997, Math.min(this.me.amount, 600));
        }

        //

        // called once per Game.Logic loop
        this.harvest = function() {
            this.rsAvailable = this.rsTotal - this.rsUsed;
            if (this.rsAvailable <= 0) {
                if (!this.depleted) Game.recalculateGains = 1;
                this.depleted = true;
            } else this.depleted = false;
            this.rsAvailable = Math.max(this.rsAvailable, 0);
            this.rsUsed = Math.min(this.rsUsed, this.rsTotal);
            if (this.pause) {
                var rate = 0.00001;
                this.rsUsed -= (rate / Game.fps) * this.rsTotal;
                this.rsUsed = Math.max(this.rsUsed, 0);
                return;
            }
            if (this.depleted) return;
            if ((this.id == 2) && Research.has("Regrowth")) return;
            this.rsUsed += (this.RhpS / Game.fps) * this.decayedFactor();
        }

        // resets everythin'
        this.clear = function() {
            this.baseYield = this.me.baseCps / baseRhpS_C;
            this.yield = this.baseYield;
            
            this.baseRhpS = baseRhpS_C; // resource harvest rate
            this.RhpS = this.baseRhpS;

            this.rsTotal = this.baseRs;
            this.rsUsed = 0;
            this.rsAvailable = this.baseRs;

            this.depleted = false;
            this.pause = false;
            this.statsView = false;

            this.getStatDiv().style.display='none';
        }


        // whatever this is



        l("productMinigameButton"+this.id).insertAdjacentHTML('afterend', 
            '<div id="productStatsButton'+this.id+'" class="productButton" onclick="Game.ObjectsById['+this.id+'].rsManager.switchStats(-1)">View Stats</div>');
        l("productMinigameButton"+this.id).insertAdjacentHTML('afterend', 
            '<div id="pauseButton'+this.id+'" class="productButton" onclick="Game.ObjectsById['+this.id+'].rsManager.switch(-1)">Pause</div>');
        l("row"+this.id).insertAdjacentHTML('beforeend', 
            '<div id="rowStats'+this.id+'" style="display: none"></div>'
        )


        this.getButton = function() { return l("productStatsButton"+this.id); }
        this.getStatDiv = function() { return l("rowStats"+this.id); }
        this.getStatDiv().insertAdjacentHTML('beforeend', '<div id="statsBG'+this.id+'"></div>')
        l('statsBG'+this.id).insertAdjacentHTML('beforeend', '<div id="stats'+this.id+'" class="subsection"></div>')
        l('stats'+this.id).insertAdjacentHTML('beforeend', '<div class="separatorTop"/>')
        l('stats'+this.id).insertAdjacentHTML('beforeend', '<div class="title" style="position:relative">'+cfl(this.me.plural)+'</div>')
        l('stats'+this.id).insertAdjacentHTML('beforeend', '<div id="statsListing'+this.id+'"></div>')
        l('stats'+this.id).insertAdjacentHTML('beforeend', '<div id="statsVisual'+this.id+'"></div>')

        var str = '';
        str+='<style>'
        +'#resBar'+this.id+'{max-width:95%;margin:4px auto;height:16px;}'
        +'#resBarFull'+this.id+'{transform:scale(1,2);transform-origin:50% 0;height:50%;}'
        +'#resBarText'+this.id+'{transform:scale(1,0.8);width:100%;position:absolute;left:0px;top:0px;text-align:center;color:#fff;text-shadow:-1px 1px #000,0px 0px 4px #000,0px 0px 6px #000;margin-top:2px;}'
        +'#statsBG'+this.id+'{background:url('+Game.resPath+'img/shadedBorders.png),url('+Game.resPath+'img/darkNoise.jpg);background-size:33% 100%,auto;position:relative;left:0px;right:0px;top:0px;bottom:16px;}'
        +'.separatorTop{width: 100%;height: 8px;background: url(img/panelHorizontal.png?v=2) repeat-x;background: url(img/panelGradientLeft.png) no-repeat top left, '
        +'url(img/panelGradientRight.png) no-repeat top right, url(img/panelHorizontal.png?v=2) repeat-x;position: absolute;left: 0px;top: 0px;}'
        +'</style>';
        //str+='<div id="resBarIcon'+this.id+'" class="usesIcon shadowFilter lumpRefill" style="left:-40px;top:-17px;background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;">';
        str+='<div id="resBar'+this.id+'" class="smallFramed meterContainer" style="width:1px;">'
        str+='<div id="resBarFull'+this.id+'" class="meter filling" style="width:1px;"></div>'
        str+='<div id="resBarText'+this.id+'" class="titleFont"></div>'
        str+='</div>'
        l('statsVisual'+this.id).innerHTML = str;

        this.mbarFull = l("resBarFull"+this.id);
        this.mbar = l("resBar"+this.id);
        this.mbarText = l("resBarText"+this.id);

        this.switchStats = function(on) {
            if (this.me.onMinigame) return;
            if (on == -1) on = !this.statsView;
            this.statsView = on;
            if (this.statsView) {
                this.getStatDiv().style.display='block';
                this.getButton().textContent = loc("Close Stats");
            } else {
                this.getStatDiv().style.display='none';
                this.getButton().textContent = loc("View Stats");
            }
        }   

        this.switch = function(on) {
            if (on == -1) on = !this.pause;
            this.pause = on;
            if (this.pause) {
                l('pauseButton'+this.id).textContent = loc("Start");
            } else {
                l('pauseButton'+this.id).textContent = loc("Pause");
            }
            Game.recalculateGains = 1;
        }
        
        this.me.switchMinigame = BModify.en.injectCode(this.me.switchMinigame, `l('row'+this.id).classList.add('onMinigame');`,
            `this.rsManager.getStatDiv().style.display='none';`, "after");

        this.me.switchMinigame = BModify.en.injectCode(this.me.switchMinigame, `l('row'+this.id).classList.remove('onMinigame');`,
            `this.rsManager.getStatDiv().style.display=this.rsManager.statsView ? 'block' : 'none';`, "after");


        this.update = function() {
            this.draw();
            str = '';
            var sty = this.depleted ? 'style="color:red"' : '';
            str+='<div class="listing"> <b>'+this.rsNames[0]+' harvest rate ('+this.rsNames[2]+'/second) per '+this.me.dname.toLowerCase()+': </b>'+Beautify(this.pause ? 0 : this.RhpS, 1);
            str+=' ('+Beautify(this.RhpS * this.decayedFactor(), 1)+' for '+Beautify(this.me.amount)+' '+this.me.plural.toLowerCase()+')</div>';
            str+='<div class="listing"> <b>Base yield: </b>'+Beautify(this.yield, 1)+ " cookies/"+this.rsNames[1]+'</div>';
            str+='<div class="listing"> <b>Total amount of '+this.rsNames[0].toLowerCase()+':</b> '+Beautify(this.rsTotal) + " " + this.rsNames[2]+'</div>';
            str+='<div class="listing"> <b>Harvested '+this.rsNames[0].toLowerCase()+' so far:</b> '+Beautify(this.rsUsed) + " " + this.rsNames[2]+'</div>';
            str+='<div class="listing" '+sty+'> <b>Base CpS:</b> '+Beautify(this.getRawCpS(), 1)+" cookies/second"+'</div>';
            str+='<div class="listing" '+sty+'> <b>CpS:</b> '+Beautify(this.me.storedTotalCps*Game.globalCpsMult, 1)+" cookies/second"+'</div>';
            l('statsListing'+this.id).innerHTML = str;
        }

        this.draw = function() {
	    	if (Game.drawT%5==0) {
	    		this.mbarFull.style.width=Math.max(Math.round((this.rsAvailable/this.rsTotal)*100), 0)+'%';
                if ((this.id == 2) && Research.has("Regrowth")) this.mbar.style.background='lightGreen';
			    this.mbar.style.width='350px';
                this.mbarText.innerHTML=Beautify(Math.max((this.rsAvailable/this.rsTotal)*100, 0), 1)+'% left';
		    }
		    this.mbarFull.style.backgroundPosition=(-Game.T*0.5)+'px';
        }

        for (var i in this.me.tieredUpgrades) {
            if (!Game.Tiers[this.me.tieredUpgrades[i].tier].special) {
                var percentage = Math.min(0.4 + 0.1 * i, 1) * 100;
                BModify.en.ue.appendToUpgradeDesc(this.me.tieredUpgrades[i], 
                    "Total "+this.rsNames[0].toLowerCase()+" <b>+"+Beautify(percentage)+"%</b>.");
            }
        }
    }

    BModify.RS_Manager.prototype.getType = function () {
        return 'RS_Manager';
    }

    BModify.Grandmas = function() {
        this.me = Game.Objects['Grandma'];

        l("productMinigameButton1").insertAdjacentHTML('afterend', 
            '<div id="grandmaSwitch" class="productButton" onclick="mod.bModify.grandma.switchStats(-1)">View Stats</div>');
        l("row1").insertAdjacentHTML('beforeend', '<div id="grandmaManagerDiv" style="display: none"></div>');

        this.getButton = function() { return l("grandmaSwitch"); }
        this.getStatDiv = function() { return l("grandmaManagerDiv"); }

        this.getStatDiv().insertAdjacentHTML('beforeend', '<div id="grandmaManagerBG"></div>')
        l('grandmaManagerBG').insertAdjacentHTML('beforeend', '<div id="grandmaManagerWrapper" class="subsection"></div>')
        l('grandmaManagerWrapper').insertAdjacentHTML('beforeend', '<div class="separatorTop"/>')
        l('grandmaManagerWrapper').insertAdjacentHTML('beforeend', '<div class="title" style="position:relative">'+cfl(this.me.plural)+'</div>')
        l('grandmaManagerWrapper').insertAdjacentHTML('beforeend', '<div id="grandmaManager"></div>')

        this.switchStats = function(on) {
            if (on == -1) on = !this.statsView;
            this.statsView = on;
            if (this.statsView) {
                this.getStatDiv().style.display='block';
                this.getButton().textContent = loc("Close Manager");
            } else {
                this.getStatDiv().style.display='none';
                this.getButton().textContent = loc("View Manager");
            }
        }

        this.update = function() {
            var str = '';
            var allocate = '';
            var remove = '';
            for (var i=2; i<20; i++) {
                var me = Game.ObjectsById[i];
                allocate = '<div class="smallFancyButton framed">Allocate</div>';
                remove = '<div class="smallFancyButton framed">Remove</div>';
                str += '<div class="listing"> Number of grandmas allocated for '+me.dname+': '+allocate+remove;
                str += '</div>';
            }
            l("grandmaManager").innerHTML = str;
        }
    }

    BModify.Idleverses = function() {
        this.me = Game.Objects['Idleverse'];

        this._ifactor = function(num) {
            if (num == 0) return 1;
            return 3 - (1.5 / Math.pow(2, num * 0.5));
        }

        this.resourceMult = function() {
            var fact = 1.003;
            if (Game.Has("Unshackled idleverses")) fact = 1.004;
            if (!Research.has("Galactica mindoris")) return 1;
            return Math.max(Math.pow(fact, this.me.amount) * this._ifactor(this.me.amount), 1);
        }

        l("row17").insertAdjacentHTML('afterbegin', 
            '<div class="listing" id="idleverseStat" style="position:absolute;color:rgb(36, 36, 36)"></div>'
        )

        this.getStat = function() {
            if (Research.has("Galactica mindoris")) {
                l("idleverseStat").innerHTML = "<b>Total resource boost provided by " + this.me.amount + " idleverses:</b> "
            + "x" + Beautify(this.resourceMult(), 3);
            }
        }
    }

    BModify.Idleverses.prototype.getType = function () {
        return 'Idleverse_Manager';
    }



    BModify.Recalculate = function() { this.rsManagers.forEach(mn => mn.recalculate()) }
    BModify.Harvest = function() { this.rsManagers.forEach(mn => mn.harvest()) }
    BModify.Logic = function() {
        BModify.Harvest();
        BModify.rsManagers.forEach(mn => mn.draw())
    }

    BModify.en.saveCallback(function() {
        BModify.rsManagers.forEach(function(me) {
            BModify.en.setVar("RhpS"+me.id, me.RhpS);
            BModify.en.setVar("yield"+me.id, me.yield);
            BModify.en.setVar("rsTotal"+me.id, me.rsTotal);
            BModify.en.setVar("rsUsed"+me.id, me.rsUsed);
            BModify.en.setVar("pause"+me.id, me.pause ? 0 : 1);
        })
    })

    BModify.en.loadCallback(function() {
        BModify.rsManagers.forEach(function(me) {
            me.RhpS = BModify.en.getVar("RhpS"+me.id);
            me.yield = BModify.en.getVar("yield"+me.id);
            me.rsTotal = BModify.en.getVar("rsTotal"+me.id);
            me.rsUsed = BModify.en.getVar("rsUsed"+me.id);
            me.pause = (BModify.en.getVar("pause"+me.id) > 0) ? true: false;
        })
    })

    Game.registerHook('cps', function(cps) {
        BModify.Recalculate();
        BModify.idleverse.getStat();
        return cps;
    })
    Game.registerHook('logic', this.Logic);
    Game.registerHook('check', function() {
        BModify.rsManagers.forEach(mn => mn.update())
    })
    Game.registerHook('reincarnate', function() {
        BModify.rsManagers.forEach(mn => mn.clear())
    })


    function replace(F) {
        var fr = F;
        fr = en.injectCode(F, "if (Game.Has('Unshackled cursors')) add*=	25;", "if (Game.Has('Unshackled cursors')) add*=	5;", "replace");
        fr = en.injectCode(F, "if (Game.Has('Trillion fingers')) add*=		20;", "if (Game.Has('Trillion fingers')) add*=		10;", "replace");
        fr = en.injectCode(F, "if (Game.Has('Quadrillion fingers')) add*=	20;", "if (Game.Has('Quadrillion fingers')) add*=	10;", "replace");
        fr = en.injectCode(F, "if (Game.Has('Quintillion fingers')) add*=	20;", "if (Game.Has('Quintillion fingers')) add*=	10;", "replace");
        return fr;
    }
    Game.mouseCps = replace(Game.mouseCps);
    Game.Objects['Cursor'].cps = replace(Game.Objects['Cursor'].cps);
    Game.Upgrades['Unshackled cursors'].ddesc = Game.Upgrades['Unshackled cursors'].ddesc.replace("25", "5");
    Game.Upgrades['Trillion fingers'].ddesc = Game.Upgrades['Trillion fingers'].ddesc.replace("20", "10");
    Game.Upgrades['Quadrillion fingers'].ddesc = Game.Upgrades['Quadrillion fingers'].ddesc.replace("20", "10");
    Game.Upgrades['Quintillion fingers'].ddesc = Game.Upgrades['Quintillion fingers'].ddesc.replace("20", "10");


    // vals
    new BModify.RS_Manager(2,  20000, ["Arable land", "acre", "acres"]);
    new BModify.RS_Manager(3,  75000, ["Cookie ore", "ton", "tons"]);
    new BModify.RS_Manager(4,  70000, ["Chocolate fuel", "liter", "liters"]);
    new BModify.RS_Manager(5,  66000, ["Interest", "dollar", "dollars"]);
    new BModify.RS_Manager(6,  62000, ["Artifact", "gram", "grams"]);
    new BModify.RS_Manager(7,  57000, ["Mana", "magic", "magic"]);
    new BModify.RS_Manager(8,  51000, ["Planet matter", "earth mass", "earth masses"])
    // Alchemy labs not included because they utilize a special mechanic;
    new BModify.RS_Manager(10, 46000, ["Warped cookies", "aetheria", "aethereiars"]);
    new BModify.RS_Manager(11, 43000, ["Reachable times", "century", "centuries"]);
    new BModify.RS_Manager(12, 39000, ["Antimatter", "gram", "grams"]);
    new BModify.RS_Manager(13, 38000, ["Light", "photon", "photons"]);
    // Chancemakers not included for scientific reasons
    new BModify.RS_Manager(15, 35000, ["Metacookie", "cookie", "cookies"]);
    new BModify.RS_Manager(16, 33000, ["Memory space", "operation", "operations"]);
    // Idleverses not included for the same reason as alchemy labs
    // Cortex bakers not included for similar reasons as the chancemaker
    new BModify.RS_Manager(19, 29000, ["Lifeforce", "pneuma", "pneumars"]);

    this.idleverse = new BModify.Idleverses();
    this.grandma = new BModify.Grandmas();
}



export { BModify }