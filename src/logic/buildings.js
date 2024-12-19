var BModify = {}

const baseRhpS_C = 1;

function cfl(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

BModify._Initialize = function(en, Research) {
    this.en = en;
    //Game.UpdateMenu = en.injectCode(Game.UpdateMenu, "(dropMult!=1", `'<div class="listing"><b>'+loc("Missed golden cookies:")+'</b> '+Beautify(Game.missedGoldenClicks)+'</div>' + `, "before")
    this.rsManagers = [];
    this.bankRefill = 0;

    this.totalDp = 0; // used for achievs

    var spr_ref = [0,1,2,3,4,15,16,17,5,6,7,8,13,14,19,20,32,33,34,35];

    en.ue.addUpgrade("Lateral expansions", "Increases all resource space by <b>50%</b>. <q>One of those fancy business words.</q>", 
        1e10, [0, 0, Icons], 13000, {unlockAt: 1e9});
    en.ue.addUpgrade("Growth ray", "Increases all resource space by <b>50%</b>. <q>Pew! Pew! Pew!</q>", 
        1e13, [0, 2, Icons], 13000, {unlockAt:1e12});
    en.ue.addUpgrade("Shrink ray", "Increases all resource space by <b>50%</b>. <q>So actually, if you make your buildings smaller, then I guess there's more resource in a way?</q>", 
        1e16, [0, 1, Icons], 13000, {unlockAt:1e15});
    
    en.ae.addAchievement("Harvester", "Deplete <b>50,000</b> units of resource in total.",
        [0, 0, Icons], "Septcentennial", {});
    en.ae.addAchievement("Industrializer", "Deplete <b>100,000</b> units of resource in total.",
        [0, 2, Icons], "Septcentennial", {});
    en.ae.addAchievement("Climate change", "Deplete <b>200,000</b> units of resource in total. <q>Guys, it exists.</q>",
        [0, 1, Icons], "Septcentennial", {});
    
    en.newVar("bankRefill", "int");

    var sstr='<style>'
        +'.resBar{max-width:95%;margin:4px auto;height:16px;}'
        +'.resBarRefill{cursor:pointer;width:48px;height:48px;position:absolute;z-index:1000;transition:transform 0.05s;transform:scale(0.8);}'
        +'.resBarRefill:hover{transform:scale(1.3);}'
        +'.resBarRefill:active{transform.scale(0.7);}'
        +'.barRefillL{left:-40px;top:-17px;}'
        +'.barRefillR{left:340px;top:-17px;}'
        +'.rlIcon{'+writeIcon([3, 0, Icons])+'}'
        +'.rrIcon{'+writeIcon([2, 0, Icons])+'}' // not fully sure why right:-40px doesn't work; think it's something about overriding
        +'.resBarFull{transform:scale(1,2);transform-origin:50% 0;height:50%;}'
        +'.resBarText{transform:scale(1,0.8);width:100%;position:absolute;left:0px;top:0px;text-align:center;color:#fff;text-shadow:-1px 1px #000,0px 0px 4px #000,0px 0px 6px #000;margin-top:2px;}'
        +'.resBarInfo{text-align:center;font-size:11px;margin-top:15px;color:rgba(255,255,255,0.75);text-shadow:-1px 1px 0px #000;}'
        +'.statsBG{background:url('+Game.resPath+'img/shadedBorders.png),url('+Game.resPath+'img/darkNoise.jpg);background-size:33% 100%,auto;position:relative;left:0px;right:0px;top:0px;bottom:16px;}'
        +'.separatorTop{width: 100%;height: 8px;background: url(img/panelHorizontal.png?v=2) repeat-x;background: url(img/panelGradientLeft.png) no-repeat top left, '
        +'url(img/panelGradientRight.png) no-repeat top right, url(img/panelHorizontal.png?v=2) repeat-x;position: absolute;left: 0px;top: 0px;}'
        +'</style>';

    l("centerArea").insertAdjacentHTML('beforeend', sstr)

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
        this.interest = 0;
        this.rsAvailable = baseRS;

        this.depleted = false;
        this.pause = false;
        this.statsView = false;

        en.newVar("RhpS"+this.me.id,  "float");
        en.newVar("yield"+this.me.id, "float");
        en.newVar("rsTotal"+this.me.id, "int");
        en.newVar("rsUsed"+this.me.id,  "int");
        en.newVar("pause"+this.me.id,   "int");

        BModify.rsManagers.push(this);

        this.getRawCpS = function() {
            var cps = this.RhpS * this.yield * Math.pow(0.997, Math.min(this.me.amount, 600));
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
                    if (Game.ascensionMode!=1 && Game.Has(me.unshackleUpgrade) && Game.Has(Game.Tiers[me.tieredUpgrades[i].tier].unshackleUpgrade)) {
                        tierMult+=me.id==1?0.5:(20-me.id)*0.1;
                    }
                    rhpsmult*=tierMult;
                    rsmult*=tierMult;
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
            if (me.grandma && Game.Has(me.grandma.name) && BModify.grandma) {
                yieldmult*=(1+BModify.grandma.grandmaAlloc[me.id-2]*0.2*(1/(me.id-1)));
            }
            if ((this.id == 2) && Research.has("Regrowth")) yieldmult*=3;
            yieldmult*=(1+0.025*Game.Objects.Farm.getLumpBuff());

            if (me.tieredResearch) {
                if (Research.hasTiered(this.id, 1)) rsmult*=2;
                if (Research.hasTiered(this.id, 2)) rsmult*=2;
                if (Research.hasTiered(this.id, 3)) rsmult*=2;
                if (Research.hasTiered(this.id, 1)) yieldmult*=(2-0.05*this.id);
                if (Research.hasTiered(this.id, 2)) yieldmult*=(2-0.05*this.id);
                if (Research.hasTiered(this.id, 3)) yieldmult*=(2-0.05*this.id);
            }
            if (Game.hasGod) {
                var godLvl=Game.hasGod('industry');
                if (godLvl==1) rhpsmult*=1.3;
                if (godLvl==2) rhpsmult*=1.2;
                if (godLvl==3) rhpsmult*=1.1;
                var godLvl=Game.hasGod('creation');
                if (godLvl==1) {rhpsmult*=0.75;yieldmult*=1.08;}
                if (godLvl==2) {rhpsmult*=0.80;yieldmult*=1.06;}
                if (godLvl==3) {rhpsmult*=0.85;yieldmult*=1.04;}
            }
            if (Game.Has("Lateral expansions")) rsmult*=1.5;
            if (Game.Has("Growth ray")) rsmult*=1.5;
            if (Game.Has("Shrink ray")) rsmult*=1.5;

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
            this.rsUsed = Math.min(this.rsUsed, this.rsTotal);
            this.rsAvailable = Math.max(this.rsAvailable, 0);
            if ((this.id == 2) && Research.has("Regrowth")) return;
            if (this.depleted) return;
            if (this.pause) {
                var rate = 0.1+(this.rsAvailable/this.rsTotal)*0.1;
                this.rsUsed -= (rate / (Game.fps * 60 * 60)) * this.rsTotal;
                this.rsUsed = Math.max(this.rsUsed, 0);
                return;
            } else {
                var dep = (this.RhpS / Game.fps) * this.decayedFactor() * (this.interest>0?1.5:1);
                this.rsUsed += dep;
                BModify.totalDp += dep;
            }
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
            this.interest = 0;

            this.depleted = false;
            this.switch(false);
            this.switchStats(false);
        }

        // whatever this is



        l("productMinigameButton"+this.id).insertAdjacentHTML('afterend', 
            '<div id="productStatsButton'+this.id+'" class="productButton" onclick="Game.ObjectsById['+this.id+'].rsManager.switchStats(-1)">View Stats</div>');
        // l("productMinigameButton"+this.id).insertAdjacentHTML('afterend', 
        //     '<div id="pauseButton'+this.id+'" class="productButton" onclick="Game.ObjectsById['+this.id+'].rsManager.switch(-1)">Pause</div>');
        l("row"+this.id).insertAdjacentHTML('beforeend',
            '<a id="pauseButton'+this.id+'" class="smallFancyButton framed" style="position:absolute;z-index:10;right:8px;bottom:22px;"'+
            ' onclick="Game.ObjectsById['+this.id+'].rsManager.switch(-1)">'+loc("Pause")+'</a>'
        )
        
        l("row"+this.id).insertAdjacentHTML('beforeend', 
            '<div id="rowStats'+this.id+'" style="display: none"></div>'
        )


        this.activButton = l("productStatsButton"+this.id); 
        this.statDiv = l("rowStats"+this.id); 
        this.statDiv.insertAdjacentHTML('beforeend', '<div id="statsBG'+this.id+'" class="statsBG"></div>')
        l('statsBG'+this.id).insertAdjacentHTML('beforeend', '<div id="stats'+this.id+'" class="subsection"></div>')
        l('stats'+this.id).insertAdjacentHTML('beforeend', '<div class="separatorTop"/>')
        l('stats'+this.id).insertAdjacentHTML('beforeend', '<div class="title" style="position:relative">'+cfl(this.me.plural)+'</div>')
        l('stats'+this.id).insertAdjacentHTML('beforeend', '<div id="statsListing'+this.id+'"></div>')
        l('stats'+this.id).insertAdjacentHTML('beforeend', '<div id="statsVisual'+this.id+'"></div>')

        var str = '';
        str+='<div id="resBar'+this.id+'" class="resBar smallFramed meterContainer" style="width:1px;">'
        str+='<div id="resBarRefillL'+this.id+'"'+Game.getDynamicTooltip('Game.ObjectsById['+this.id+'].rsManager.refillTooltipL', 'this')+' class="shadowFilter resBarRefill barRefillL rlIcon"></div>'
        str+='<div id="resBarRefillR'+this.id+'"'+Game.getDynamicTooltip('Game.ObjectsById['+this.id+'].rsManager.refillTooltipR', 'this')+' class="shadowFilter resBarRefill barRefillR rrIcon"></div>'
        str+='<div id="resBarFull'+this.id+'" class="resBarFull meter filling" style="width:1px;"></div>'
        str+='<div id="resBarText'+this.id+'" class="resBarText titleFont"></div>'
        str+='<div id="resBarInfo'+this.id+'" class="resBarInfo"></div>'
        str+='</div>'
        l('statsVisual'+this.id).innerHTML = str;

        this.mbarFull = l("resBarFull"+this.id);
        this.mbar = l("resBar"+this.id);
        this.mbarText = l("resBarText"+this.id);
        this.mbarInfo = l("resBarInfo"+this.id);
        this.refillL = l("resBarRefillL"+this.id);
        this.refillR = l("resBarRefillR"+this.id);

        this.switchStats = function(on) {
            if (this.me.onMinigame) return;
            if (on == -1) on = !this.statsView;
            this.statsView = on;
            if (this.statsView) {
                this.statDiv.style.display='block';
                this.activButton.textContent = loc("Close Stats");
            } else {
                this.statDiv.style.display='none';
                this.activButton.textContent = loc("View Stats");
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
        
        this.me.switchMinigame = en.injectCode(this.me.switchMinigame, `l('row'+this.id).classList.add('onMinigame');`,
            `this.rsManager.statDiv.style.display='none';`, "after");

        this.me.switchMinigame = en.injectCode(this.me.switchMinigame, `l('row'+this.id).classList.remove('onMinigame');`,
            `this.rsManager.statDiv.style.display=this.rsManager.statsView ? 'block' : 'none';`, "after");


        this.update = function() {
            this.draw();
            str = '';
            var sty = '';
            if (this.pause) sty='style="color:cyan"';
            if (this.depleted) sty='style="color:red"';
            str+='<div class="listing" '+sty+'> <b>'+this.rsNames[0]+' use rate ('+this.rsNames[2]+'/second) per '+this.me.dname.toLowerCase()+': </b>'+
                Beautify((this.pause || this.depleted) ? 0 : this.RhpS*(this.interest>0?1.5:1), 1);
            str+=' ('+Beautify(this.RhpS * this.decayedFactor()*(this.interest>0?1.5:1), 1)+' for '+Beautify(this.me.amount)+' '+this.me.plural.toLowerCase();
            str+=')'+(((this.interest>0)&&(!this.pause)&&(!this.depleted))?' <span class="red">(50% faster due to interest)</span>':'')+'</div>';
            str+='<div class="listing"> <b>Base yield: </b>'+Beautify(this.yield, 1)+ " cookies/"+this.rsNames[1]+'</div>';
            str+='<div class="listing"> <b>Total amount of '+this.rsNames[0].toLowerCase()+':</b> '+Beautify(this.rsTotal) + " " + this.rsNames[2]+'</div>';
            str+='<div class="listing"> <b>Used '+this.rsNames[0].toLowerCase()+' so far:</b> '+Beautify(this.rsUsed) + " " + this.rsNames[2]+'</div>';
            str+='<div class="listing" '+sty+'> <b>Base CpS:</b> '+Beautify(this.getRawCpS()*this.me.amount, 1)+" cookies/second"+'</div>';
            str+='<div class="listing" '+sty+'> <b>CpS:</b> '+Beautify(this.me.storedTotalCps*Game.globalCpsMult, 1)+" cookies/second"+'</div>';
            l('statsListing'+this.id).innerHTML = str;
            if (Game.Objects.Bank.minigame) this.refillR.style.display='inline';
            else this.refillR.style.display='none';
        }

        // will be implemented soon
        this.refillTooltipL = function() {
            var str = "Click to <b>refill available resources by 35%</b> and prevent depletion for <b>1 minute</b> for ??? power clicks.";
            str += "<br><small>(not yet implemented)</small>";
            return '<div style="padding:8px;width:300px;font-size:11px;text-align:center;" id="tooltipRefill">'+str+'</div>';
        }

        this.refillPrice = function() {
            var price = 300000+Math.min(Game.Objects.Cursor.level, 12) * 25000;
            if (this.depleted) price *= 2.5;
            return price;
        }
        this.refillTooltipR = function() {
            if (!Game.Objects.Bank.minigame) return '';
            var col = (Game.Objects.Bank.minigame.profit >= this.refillPrice()) ? '#73f21e' : '#f21e3c';
            var str = "Click to <b>refill available resources by 50%</b> for <span style='color:"+col+";'>$"+this.refillPrice()+"</span>.";
            str += "<br>However, this will cause resources to deplete <b>50%</b> faster for <b>20 minutes</b> without any CpS boost.";

            str += (BModify.bankRefill>0?"<br><small class='red'>(usable again in "+Game.sayTime(BModify.bankRefill+Game.fps, -1)+")</small>"
                :"<br><small>(Cooldown time upon use: "+(this.depleted?"<span class='red'>3 hours</span>":"1 hour")+")</small>");
            return '<div style="padding:8px;width:300px;font-size:11px;text-align:center;" id="tooltipRefill">'+str+'</div>';
        }

        AddEvent(this.refillL,'click',function(){
            var me = Game.ObjectsById[id].rsManager;
            
            console.log("Refill L");
            PlaySound('snd/pop'+Math.floor(Math.random()*3+1)+'.mp3',0.75);
        });

        AddEvent(this.refillR,'click',function(){
            if (!Game.Objects.Bank.minigame) return;
            var me = Game.ObjectsById[id].rsManager;
            var mini = Game.Objects.Bank.minigame;
            if ((mini.profit >= me.refillPrice()) && (BModify.bankRefill<=0)) {
                mini.profit -= me.refillPrice();
                me.rsUsed -= 0.5 * me.rsTotal;
                me.rsUsed = Math.max(me.rsUsed, 0);
                me.rsAvailable = me.rsTotal - me.rsUsed;
                me.update();
                Game.recalculateGains = 1;
                BModify.bankRefill = Game.fps * 60 * (me.depleted ? 180 : 60);
                me.interest = Game.fps * 60 * 20;
                PlaySound('snd/pop'+Math.floor(Math.random()*3+1)+'.mp3',0.75);
            }
        });

        this.draw = function() {
	    	if (Game.drawT%5==0) {
	    		this.mbarFull.style.width=Math.max(Math.round((this.rsAvailable/this.rsTotal)*100), 0)+'%';
                if ((this.id == 2) && Research.has("Regrowth")) this.mbar.style.background='lightGreen';
                else if (this.interest>0) this.mbar.style.background='lightRed';
			    this.mbar.style.width='350px';
                this.mbarText.innerHTML=Beautify(Math.max((this.rsAvailable/this.rsTotal)*100, 0), 1)+'% left';
                if (this.depleted) this.mbarInfo.innerHTML='This resource has been depleted';
                else if (this.pause) this.mbarInfo.innerHTML='Currently paused';
                else if ((this.id == 2) && Research.has("Regrowth")) this.mbarInfo.innerHTML='Regrowth is currently active.';
                else this.mbarInfo.innerHTML='Depletion rate: -'
                    +Beautify(Math.max(((this.RhpS*this.decayedFactor()*(this.interest>0?1.5:1))/this.rsTotal)*100, 0), 2)+'%/s (-'
                    +Beautify(Math.max(((this.RhpS*this.decayedFactor()*(this.interest>0?1.5:1))/this.rsTotal)*100*60, 0), 2)+'%/min)';
		    }
		    this.mbarFull.style.backgroundPosition=(-Game.T*0.5)+'px';
            if (this.interest>0) this.interest--;
        }

        for (var i in this.me.tieredUpgrades) {
            if (!Game.Tiers[this.me.tieredUpgrades[i].tier].special) {
                en.ue.appendToDesc(this.me.tieredUpgrades[i], 
                    "Total "+this.rsNames[0].toLowerCase()+" <b>doubled</b>.");
            }
        }
    }

    BModify.RS_Manager.prototype.getType = function () {
        return 'RS_Manager';
    }

    BModify.Grandmas = function() {
        this.me = Game.Objects['Grandma'];

        l("productMinigameButton1").insertAdjacentHTML('afterend', 
            '<div id="grandmaSwitch" class="productButton" onclick="mod.bModify.grandma.switchStats(-1)">'+loc('View Manager')+'</div>');
        l("row1").insertAdjacentHTML('beforeend', '<div id="grandmaManagerDiv" style="display: none"></div>');

        this.activButton = l("grandmaSwitch"); 
        this.statDiv = l("grandmaManagerDiv"); 

        var str = '';
        str+='<style>'
        +'#grandmaManagerBG{background:url('+Game.resPath+'img/shadedBorders.png),url('+Game.resPath+'img/darkNoise.jpg);background-size:33% 100%,auto;position:relative;left:0px;right:0px;top:0px;bottom:16px;}'
        +'.separatorTop{width: 100%;height: 8px;background: url(img/panelHorizontal.png?v=2) repeat-x;background: url(img/panelGradientLeft.png) no-repeat top left, '
        +'url(img/panelGradientRight.png) no-repeat top right, url(img/panelHorizontal.png?v=2) repeat-x;position: absolute;left: 0px;top: 0px;}'
        +'</style>';

        this.statDiv.insertAdjacentHTML('beforeend', '<div id="grandmaManagerBG"></div>')
        l('grandmaManagerBG').insertAdjacentHTML('beforeend', '<div id="grandmaManagerWrapper" class="subsection"></div>')
        l('grandmaManagerWrapper').insertAdjacentHTML('beforeend', str)
        l('grandmaManagerWrapper').insertAdjacentHTML('beforeend', '<div class="separatorTop"/>')
        l('grandmaManagerWrapper').insertAdjacentHTML('beforeend', '<div class="title" style="position:relative">'+cfl(this.me.plural)+'</div>')
        l('grandmaManagerWrapper').insertAdjacentHTML('beforeend', '<div id="grandmaManager" style="overflow:auto"></div>')
        
        this.grandmaAlloc = new Array(18).fill(0);
        this.allocT = 0;

        for (var i=0;i<18;i++) en.newVar("grandmaAlloc"+i, "int");
        en.newVar("allocT", "int");

        this.switchStats = function(on) {
            if (on == -1) on = !this.statsView;
            this.statsView = on;
            if (this.statsView) {
                this.statDiv.style.display='block';
                this.activButton.textContent = loc("Close Manager");
            } else {
                this.statDiv.style.display='none';
                this.activButton.textContent = loc("View Manager");
            }
        }

        this.maxGrandmas = function(index) {
            return Math.ceil(this.me.amount * 0.05) + 3 * this.me.level;
        }

        this.alloc = function(index) {
            if (this.allocT == this.me.amount) return;
            this.grandmaAlloc[index] += 1;
            if (this.grandmaAlloc[index] > this.maxGrandmas(index)) {
                this.grandmaAlloc[index] = this.maxGrandmas(index);
            } else this.allocT += 1;
            this.update();
            Game.recalculateGains = 1;
        }

        this.remove = function(index) {
            this.grandmaAlloc[index] -= 1;
            if (this.grandmaAlloc[index] < 0) {
                this.grandmaAlloc[index] = 0;
            } else this.allocT -= 1;
            this.update();
            Game.recalculateGains = 1;
        }

        this.canSell = function() {
            var popup = "Can't sell any more grandmas!";
            if (this.allocT == this.me.amount) {
                Game.Popup(popup, Game.mouseX, Game.mouseY);
                return false;
            }
            var max = Math.ceil((this.me.amount-1) * 0.05) + 3 * this.me.level;
            for (var i=0; i<18;i++){
                if (this.grandmaAlloc[i] > max) {
                    Game.Popup(popup, Game.mouseX, Game.mouseY);
                    return false;
                }
            }
            return true;
        }

        this.cpsGrandmas = function() {return this.me.amount - this.allocT;}

        this.clear = function() {
            for (var i=0; i<18;i++){
                this.grandmaAlloc[i]=0;
                this.allocT=0;
            }
        }

        this.update = function() {
            var str = '';
            var allocate = '';
            var remove = '';
            str += '<div class="listing">Number of grandmas allocated in total: ' + this.allocT + '</div>';
            for (var i=0; i<18; i++) {
                var me = Game.ObjectsById[i+2];
                if (Game.Has(me.grandma.name)) {
                    allocate = '<a class="smallFancyButton" onclick="mod.bModify.grandma.alloc('+i+')" style="width: 70px;">'+loc('Allocate')+'</a>';
                    remove = '<a class="smallFancyButton" onclick="mod.bModify.grandma.remove('+i+')" style="width: 70px;">'+loc('Remove')+'</a>';
                    str += '<div class="listing">'+tinyIcon([spr_ref[i+2],0]);
                    str += ': '+allocate + " " + this.grandmaAlloc[i] + " " + remove; 
                    str += '(max: '+this.maxGrandmas()+')';
                    str += '</div>';
                }
            }
            str += '<div class="listing">Number of grandmas used for cookie production: ' + this.cpsGrandmas() + '</div>';
            l("grandmaManager").innerHTML = str;
        }

        this.me.sell = en.injectCode(this.me.sell, "price=Math.floor(price*giveBack);", "if ((this.id == 1) && (!mod.bModify.grandma.canSell())) break;", "after");
        Game.CalculateGains = en.injectCode(Game.CalculateGains, "me.storedTotalCps=me.amount*me.storedCps;",
            "\n\tif(me.id == 1) me.storedTotalCps=mod.bModify.grandma.cpsGrandmas()*me.storedCps;", "after"
        )
        Game.GetTieredCpsMult = en.injectCode(Game.GetTieredCpsMult, 
            "mult*=(1+Game.Objects['Grandma'].amount*0.01*(1/(me.id-1)));",
            "mult*=(1+mod.bModify.grandma.grandmaAlloc[me.id-2]*0.2*(1/(me.id-1)))*(1+0.04*Game.Objects.Grandma.getLumpBuff());", 
            "replace"
        )
        this.me.tooltip = en.injectCode(this.me.tooltip,
            "var mult=me.amount*0.01*(1/(other.id-1));",
            "var mult=1+mod.bModify.grandma.grandmaAlloc[other.id-2]*0.2*(1/(other.id-1))*(1+0.04*Game.Objects.Grandma.getLumpBuff());", 
            "replace"
        )
        en.saveCallback(function() {
            for (var i=0;i<18;i++) en.setVar("grandmaAlloc"+i, BModify.grandma.grandmaAlloc[i]);
            en.setVar("allocT", BModify.grandma.allocT);
        })
        en.loadCallback(function() {
            for (var i=0;i<18;i++) BModify.grandma.grandmaAlloc[i] = en.getVar("grandmaAlloc"+i);
            BModify.grandma.allocT = en.getVar("allocT", BModify.grandma.allocT);
        })

        this.me.cps = en.injectChain(this.me.cps, "mult*=Game.magicCpS(me.name);", 
            [
                'if (mod.research.hasTiered(1, 1)) mult*=1.15;',
                'if (mod.research.hasTiered(1, 2)) mult*=1.15;',
                'if (mod.research.hasTiered(1, 3)) mult*=1.15;'
            ]
        )
    }

    BModify.Idleverses = function() {
        this.me = Game.Objects['Idleverse'];

        this._ifactor = function(num) {
            if (num == 0) return 1;
            return 2 - Math.max((1 / Math.pow(2, num * 0.5)),0.001);
        }

        this.resourceMult = function() {
            var fact = 1.003;
            if (Game.Has("Unshackled idleverses")) fact = 1.004;
            if (!Research.has("Galactica mindoris")) return 1;
            return Math.max(Math.pow(fact, this.me.amount) * this._ifactor(this.me.amount), 1);
        }

        l("row17").insertAdjacentHTML('afterbegin', 
            '<div class="listing" id="idleverseStat" style="position:absolute;color:rgb(36, 36, 36)" class="onlyOnCanvas"></div>'
        )

        this.getStat = function() {
            if (Research.has("Galactica mindoris")) {
                l("idleverseStat").innerHTML = "<b>"+loc("Total resource boost provided by")+" "+this.me.amount+" idleverses:</b> "
            + "x" + Beautify(this.resourceMult(), 3);
            } else l("idleverseStat").innerHTML = "<b>You do not have the Galactica mindoris research upgrade, and are gaining no resource space from idleverses.</b>"
        }

        this.me.cps = en.injectChain(this.me.cps, "mult*=Game.magicCpS(me.name);", 
            [
                'if (mod.research.hasTiered(17, 1)) mult*=1.3;',
                'if (mod.research.hasTiered(17, 2)) mult*=1.3;',
                'if (mod.research.hasTiered(17, 3)) mult*=1.3;'
            ]
        )
    }

    BModify.Idleverses.prototype.getType = function () {
        return 'Idleverse_Manager';
    }

    BModify.Mines = function() {
        var me = this;
        this.me = Game.Objects['Mine'];
        this.rs = this.me.rsManager;
        this.ores = [];
        this.id = 0;

        this.Ore = function(baseRs, baseRhpS, name1, name2, sprite) {
            this.rsTotal = baseRs;
            this.rsUsed = 0;
            this.oreH = 0;
            this.rsAvailable = baseRs;
            this.RhpS = baseRhpS;
            this.id = me.id;

            en.newVar("RhpS"+name2,  "float");
            en.newVar("rsTotal"+name2, "int");
            en.newVar("rsUsed"+name2,  "int");
            en.newVar("oreH"+name2,    "int");
            var _name = function(){return name2.toLowerCase()}

            this.oreName = name1;
            this.name = name2;

            this.unlocked = false;
            this.depleted = false;

            this.recalculate = function() {
                var rhpsmult = 1;
                var rsmult = 1;



                this.RhpS = baseRhpS * rhpsmult;
                this.rsTotal = baseRs * rsmult;
                this.rsAvailable = this.rsTotal - this.rsUsed;
            }

            this.harvest = function() {
                this.rsAvailable = this.rsTotal - this.rsUsed;
                if (this.rsAvailable <= 0) {
                    this.depleted = true;
                } else this.depleted = false;
                this.rsUsed = Math.min(this.rsUsed, this.rsTotal);
                this.rsAvailable = Math.max(this.rsAvailable, 0);
                if (!this.unlocked) return;
                if (this.depleted) return;
                this.rsUsed += (this.RhpS / Game.fps);
                this.oreH += (this.RhpS / Game.fps);
            }

            this.clear = function() {
                this.rsTotal = baseRs;
                this.rsUsed = 0;
                this.oreH = 0;
                this.rsAvailable = baseRs;
                this.RhpS = baseRhpS;

                this.baseRhpS = baseRhpS;
                this.baseRs = baseRs;
                this.unlocked = false;
            }

            this.update = function() {

            }

            this.draw = function() {

            }

            me.ores.push(this);
            me.id++;
        }

        this.Ore.prototype.getType = function() {
            return 'Mine_Ore';
        }

        new this.Ore(77000, 1, "Gold ore", "Gold", [0, 0]);

        en.saveCallback(function() {
            BModify.mine.ores.forEach(function(me) {
                en.setVar("RhpS"+me.name,    me.RhpS);
                en.setVar("oreH"+me.name,    me.oreH);
                en.setVar("rsTotal"+me.name, me.rsTotal);
                en.setVar("rsUsed"+me.name,  me.rsUsed);
            })
        })
        en.loadCallback(function() {
            BModify.mine.ores.forEach(function(me) {
                me.RhpS =    en.getVar("RhpS"+me.name,    me.RhpS);
                me.oreH =    en.getVar("oreH"+me.name,    me.oreH);
                me.rsTotal = en.getVar("rsTotal"+me.name, me.rsTotal);
                me.rsUsed =  en.getVar("rsUsed"+me.name,  me.rsUsed);
            })
        })
    }

    BModify.Mines.prototype.getType = function () {
        return 'Mine_Mini';
    }

    BModify.Recalculate = function() { 
        this.rsManagers.forEach(mn => mn.recalculate()) 
        this.mine.ores.forEach(mn => mn.recalculate())
    }
    BModify.Harvest = function() { 
        this.rsManagers.forEach(mn => mn.harvest()) 
        this.mine.ores.forEach(mn => mn.harvest())
    }
    BModify.Logic = function() {
        BModify.Harvest()
        BModify.rsManagers.forEach(mn => mn.draw())
        BModify.mine.ores.forEach(mn => mn.draw())
        if (BModify.bankRefill>0) BModify.bankRefill--
    }

    en.saveCallback(function() {
        BModify.rsManagers.forEach(function(me) {
            en.setVar("RhpS"+me.id,    me.RhpS);
            en.setVar("yield"+me.id,   me.yield);
            en.setVar("rsTotal"+me.id, me.rsTotal);
            en.setVar("rsUsed"+me.id,  me.rsUsed);
            en.setVar("pause"+me.id,   me.pause ? 1 : 0);
        })
        en.setVar("bankRefill", BModify.bankRefill);
    })

    en.loadCallback(function() {
        BModify.rsManagers.forEach(function(me) {
            me.RhpS =    en.getVar("RhpS"+me.id,    me.RhpS);
            me.yield =   en.getVar("yield"+me.id,   me.yield);
            me.rsTotal = en.getVar("rsTotal"+me.id, me.rsTotal);
            me.rsUsed =  en.getVar("rsUsed"+me.id,  me.rsUsed);
            me.pause =  (en.getVar("pause"+me.id,   me.pause) > 0) ? true: false;
        })
        BModify.bankRefill = en.getVar("bankRefill", BModify.bankRefill);
    })

    Game.registerHook('cps', function(cps) {
        BModify.Recalculate();
        BModify.idleverse.getStat();
        return cps;
    })
    Game.registerHook('logic', this.Logic);
    Game.registerHook('check', function() {
        BModify.rsManagers.forEach(mn => mn.update())
        BModify.grandma.update()
        BModify.mine.ores.forEach(mn => mn.update())

        if (BModify.totalDp >= 50000) Game.Win("Harvester") 
        if (BModify.totalDp >= 100000) Game.Win("Industrializer")
        if (BModify.totalDp >= 200000) Game.Win("Climate change")
    })
    Game.registerHook('reset', function() {
        BModify.rsManagers.forEach(mn => mn.clear())
        BModify.grandma.clear()
        BModify.mine.ores.forEach(mn => mn.clear())
        BModify.bankRefill=0
        BModify.totalDp=0
    })


    // vals
    new BModify.RS_Manager(2,  20000, ["Arable land", "acre", "acres"]);
    new BModify.RS_Manager(3,  75000, ["Cookie ore", "ton", "tons"]);
    new BModify.RS_Manager(4,  70000, ["Chocolate fuel", "liter", "liters"]);
    new BModify.RS_Manager(5,  66000, ["Interest", "dollar", "dollars"]);
    new BModify.RS_Manager(6,  62000, ["Artifact", "gram", "grams"]);
    new BModify.RS_Manager(7,  57000, ["Mana", "magic", "magic"]);
    new BModify.RS_Manager(8,  51000, ["Planet matter", "earth mass", "earth masses"]);
    new BModify.RS_Manager(9,  49000, ["Gold", "gram", "grams"]);
    new BModify.RS_Manager(10, 46000, ["Warped cookies", "aetheria", "aethereiars"]);
    new BModify.RS_Manager(11, 43000, ["Reachable times", "century", "centuries"]);
    new BModify.RS_Manager(12, 39000, ["Antimatter", "gram", "grams"]);
    new BModify.RS_Manager(13, 38000, ["Light", "photon", "photons"]);
    // Chancemakers not included for scientific reasons + minigame
    new BModify.RS_Manager(15, 35000, ["Metacookie", "cookie", "cookies"]);
    new BModify.RS_Manager(16, 33000, ["Memory", "byte", "bytes"]);
    // Idleverses not included for the same reason as alchemy labs
    new BModify.RS_Manager(18, 31000, ["Neural space", "megaparsec", "megaparsecs"]);
    new BModify.RS_Manager(19, 29000, ["Lifeforce", "pneuma", "pneumars"]);

    this.idleverse = new BModify.Idleverses();
    this.grandma = new BModify.Grandmas();
    this.mine = new BModify.Mines();
}



export { BModify }