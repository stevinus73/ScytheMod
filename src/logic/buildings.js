var BModify = {}

// var str='';
// 		str+='<style>'+
// 		'#grimoireBG{background:url('+Game.resPath+'img/shadedBorders.png),url('+Game.resPath+'img/BGgrimoire.jpg);background-size:100% 100%,auto;position:absolute;left:0px;right:0px;top:0px;bottom:16px;}'+
// 		'#grimoireContent{position:relative;box-sizing:border-box;padding:4px 24px;}'+
// 		'#grimoireBar{max-width:95%;margin:4px auto;height:16px;}'+
// 		'#grimoireBarFull{transform:scale(1,2);transform-origin:50% 0;height:50%;}'+
// 		'#grimoireBarText{transform:scale(1,0.8);width:100%;position:absolute;left:0px;top:0px;text-align:center;color:#fff;text-shadow:-1px 1px #000,0px 0px 4px #000,0px 0px 6px #000;margin-top:2px;}'+
// 		'#grimoireSpells{text-align:center;width:100%;padding:8px;box-sizing:border-box;}'+
// 		'.grimoireIcon{pointer-events:none;margin:2px 6px 0px 6px;width:48px;height:48px;opacity:0.8;position:relative;}'+
// 		'.grimoirePrice{pointer-events:none;}'+
// 		'.grimoireSpell{box-shadow:4px 4px 4px #000;cursor:pointer;position:relative;color:#f33;opacity:0.8;text-shadow:0px 0px 4px #000,0px 0px 6px #000;font-weight:bold;font-size:12px;display:inline-block;width:60px;height:74px;background:url('+Game.resPath+'img/spellBG.png);}'+
// 		'.grimoireSpell.ready{color:rgba(255,255,255,0.8);opacity:1;}'+
// 		'.grimoireSpell.ready:hover{color:#fff;}'+
// 		'.grimoireSpell:hover{box-shadow:6px 6px 6px 2px #000;z-index:1000000001;top:-1px;}'+
// 		'.grimoireSpell:active{top:1px;}'+
// 		'.grimoireSpell.ready .grimoireIcon{opacity:1;}'+
// 		'.grimoireSpell:hover{background-position:0px -74px;} .grimoireSpell:active{background-position:0px 74px;}'+
// 		'.grimoireSpell:nth-child(4n+1){background-position:-60px 0px;} .grimoireSpell:nth-child(4n+1):hover{background-position:-60px -74px;} .grimoireSpell:nth-child(4n+1):active{background-position:-60px 74px;}'+
// 		'.grimoireSpell:nth-child(4n+2){background-position:-120px 0px;} .grimoireSpell:nth-child(4n+2):hover{background-position:-120px -74px;} .grimoireSpell:nth-child(4n+2):active{background-position:-120px 74px;}'+
// 		'.grimoireSpell:nth-child(4n+3){background-position:-180px 0px;} .grimoireSpell:nth-child(4n+3):hover{background-position:-180px -74px;} .grimoireSpell:nth-child(4n+3):active{background-position:-180px 74px;}'+
		
// 		'.grimoireSpell:hover .grimoireIcon{top:-1px;}'+
// 		'.grimoireSpell.ready:hover .grimoireIcon{animation-name:bounce;animation-iteration-count:infinite;animation-duration:0.8s;}'+
// 		'.noFancy .grimoireSpell.ready:hover .grimoireIcon{animation:none;}'+
		
// 		'#grimoireInfo{text-align:center;font-size:11px;margin-top:12px;color:rgba(255,255,255,0.75);text-shadow:-1px 1px 0px #000;}'+
// 		'</style>';
// 		str+='<div id="grimoireBG"></div>';
// 		str+='<div id="grimoireContent">';
// 			str+='<div id="grimoireSpells">';//did you know adding class="shadowFilter" to this cancels the "z-index:1000000001" that displays the selected spell above the tooltip? stacking orders are silly https://philipwalton.com/articles/what-no-one-told-you-about-z-index/
// 			for (var i in M.spells)
// 			{
// 				var me=M.spells[i];
// 				var icon=me.icon||[28,12];
// 				str+='<div class="grimoireSpell titleFont" id="grimoireSpell'+me.id+'" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.spellTooltip('+me.id+')','this')+'><div class="usesIcon shadowFilter grimoireIcon" style="background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div><div class="grimoirePrice" id="grimoirePrice'+me.id+'">-</div></div>';
// 			}
// 			str+='</div>';
// 			var icon=[29,14];
// 			str+='<div id="grimoireBar" class="smallFramed meterContainer" style="width:1px;"></div>'
//          str+='<div id="grimoireBarFull" class="meter filling" style="width:1px;"></div>'
//          str+='<div id="grimoireBarText" class="titleFont"></div><div '+Game.getTooltip('<div style="padding:8px;width:300px;font-size:11px;text-align:center;">'+loc("This is your magic meter. Each spell costs magic to use.<div class=\"line\"></div>Your maximum amount of magic varies depending on your amount of <b>Wizard towers</b>, and their level.<div class=\"line\"></div>Magic refills over time. The lower your magic meter, the slower it refills.")+'</div>')+' style="position:absolute;left:0px;top:0px;right:0px;bottom:0px;"></div></div>';
// 			str+='<div id="grimoireInfo"></div>';
// 		str+='</div>';
// 		div.innerHTML=str;
// 		M.magicBarL=l('grimoireBar');
// 		M.magicBarFullL=l('grimoireBarFull');
// 		M.magicBarTextL=l('grimoireBarText');
// 		M.lumpRefill=l('grimoireLumpRefill');
// 		M.infoL=l('grimoireInfo');

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
            if (this.depleted) return;
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

        this.getStatDiv().insertAdjacentHTML('beforeend', '<div id="stats'+this.id+'" class="subsection"></div>')
        l('stats'+this.id).insertAdjacentHTML('beforeend', '<div class="title" style="position:relative">'+this.me.dname+'s</div>')
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
            str+='<div class="listing"> <b>'+this.rsNames[0]+' harvest rate ('+this.rsNames[2]+'/second) per '+this.me.dname.toLowerCase()+': </b>'+Beautify(this.RhpS);
            str+=' ('+Beautify(this.RhpS * this.me.amount)+' for '+Beautify(this.me.amount)+' '+this.me.plural.toLowerCase()+')</div>';
            str+='<div class="listing"> <b>Yield: </b>'+Beautify(this.yield)+ " cookies/"+this.rsNames[1]+'</div>';
            str+='<div class="listing"> <b>Total amount of '+this.rsNames[3]+':</b> '+Beautify(this.rsTotal) + " " + this.rsNames[2]+'</div>';
            str+='<div class="listing"> <b>Harvested '+this.rsNames[3]+' so far:</b> '+Beautify(this.rsUsed) + " " + this.rsNames[2]+'</div>';
            str+='<div class="listing"> <b>Total CpS:</b> '+Beautify(this.getRawCpS())+" cookies/second"+'</div>';
            l('statsListing'+this.id).innerHTML = str;
        }

        this.draw = function() {
	    	if (Game.drawT%5==0) {
	    		this.mbarFull.style.width=Math.round((this.rsAvailable/this.rsTotal)*100)+'%';
			    this.mbar.style.width='150px';
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





    // testing, for farms, mines
    new BModify.RS_Manager(2, 40000, ["Arable land", "acre", "acres", "arable land"]);
    new BModify.RS_Manager(3, 150000, ["Cookie ore", "ton", "tons", "cookie ore"]);
    new BModify.RS_Manager(4, 135000, ["Chocolate fuel", "liter", "liters", "chocolate fuel"]);
}



export { BModify }