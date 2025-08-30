var BModify = {}

const baseRhpS_C = 1;

function cfl(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

BModify._Initialize = function (en, Research) {
    this.en = en;
    en.ue.setBatch('buildUp');
    en.ae.setBatch('buildAc');
    //Game.UpdateMenu = en.injectCode(Game.UpdateMenu, "(dropMult!=1", `'<div class="listing"><b>'+loc("Missed golden cookies:")+'</b> '+Beautify(Game.missedGoldenClicks)+'</div>' + `, "before")
    this.rsManagers = [];
    this.bankRefill = 0;

    this.totalDp = 0; // used for achievs

    var spr_ref = [0, 1, 2, 3, 4, 15, 16, 17, 5, 6, 7, 8, 13, 14, 19, 20, 32, 33, 34, 35];

    en.ue.addUpgrade("Lateral expansions", "Increases all resource space by <b>50%</b>. <q>One of those fancy business words.</q>",
        1e10, [0, 0, Icons], 13000, { unlockAt: 1e9 });
    en.ue.addUpgrade("Growth ray", "Increases all resource space by <b>50%</b>. <q>Pew! Pew! Pew!</q>",
        1e13, [0, 2, Icons], 13000, { unlockAt: 1e12 });
    en.ue.addUpgrade("Shrink ray", "Increases all resource space by <b>50%</b>. <q>So actually, if you make your buildings smaller, then I guess there's more resource in a way?</q>",
        1e16, [0, 1, Icons], 13000, { unlockAt: 1e15 });

    en.ae.addAchievement("Harvester", "Deplete <b>50,000</b> units of resource in total.",
        [0, 0, Icons], "Septcentennial", {});
    en.ae.addAchievement("Industrializer", "Deplete <b>100,000</b> units of resource in total.",
        [0, 2, Icons], "Septcentennial", {});
    en.ae.addAchievement("Climate change", "Deplete <b>200,000</b> units of resource in total. <q>Guys, it exists.</q>",
        [0, 1, Icons], "Septcentennial", {});
    en.ae.addAchievement("Flash", "Maintain a speed of <b>x3</b> or higher for <b>5 minutes</b> while having an energy consumption of at least <b>25k/sec</b>.",
        [12, 5], "Just wrong", {});
    en.ae.addAchievement("Lightspeed", "Maintain a speed of <b>x6</b> or higher for <b>10 minutes</b> while having an energy consumption of at least <b>200k/sec</b>.",
        [13, 5], "Just wrong", {});
    en.ae.addAchievement("Infinity and beyond", "Maintain a speed of <b>x12</b> or higher for <b>15 minutes</b> while having an energy consumption of at least <b>5M/sec</b>.",
        [14, 5], "Just wrong", {});
    en.ae.addAchievement("Through the fourth wall", "Maintain a speed of <b>x50</b> or higher for <b>30 minutes</b> while having an energy consumption of at least <b>40M/sec</b>.",
        [14, 5], "Third-party", {pool: 'shadow'});

    en.newVar('rsData', 'string');

    BModify.energy = 0;
    BModify.maxEnergy = 1000;
    BModify.consumption = 0;
    BModify.production = 0;
    BModify.baseEfficiency = 1;
    BModify.efficiency = 1;
    BModify.stress = 0;
    BModify.speed = 1;
    // for increases
    BModify.nextInc = 3;

    BModify.trackAch = [0, 0, 0, 0];
    BModify.powerPlants = 0;

    BModify.batteryPercent = 1.0;
    BModify.batteryMustRefill = false;
    BModify.batteryActive = false;

    const bscale = {
        'Mine': 2,
        'Factory': 2,
        'Bank': 3,
        'Temple': 3,
        'Wizard tower': 5,
        'Shipment': 14,
        'Alchemy lab': 12, //20,
        'Portal': 20, //50,
        'Time machine': 36, //70,
        'Antimatter condenser': 80, //120,
        'Prism': 65, //110,
        'Chancemaker': 110,
        'Fractal engine': 90,
        'Javascript console': 170, //300,
        'Idleverse': 500, //500,
        'Cortex baker': 600, //1000,
        'You': 800, //1700 
    }
    for (var i in Game.Objects) {
        Game.Objects[i].baseConsumption = 0.1 * (bscale[i] ? bscale[i] : 1) * (Game.Objects[i].id + 1); //0.1 * Math.round(Math.pow(2.3, Game.Objects[i].id) * (Game.Objects[i].id + 1));
    }

    // Game.Draw = en.injectCode(Game.Draw, `l('cookies').innerHTML=str;`,
    //     `str=str+mod.bModify.getEnergyDisplay();`,
    //     "before");

    // BModify.getEnergyDisplay = function () {
    //     return '<div style="font:14px sans-serif;display:flex;align-items:center;justify-content:center;">'
    //         + '<div class="icon" style="transform:scale(0.9);' + writeIcon([0, 4, Icons]) + '"></div>'
    //         + 'Energy: ' + Beautify(Math.ceil(this.energy)) + '/' + Beautify(this.maxEnergy) + '</div>';
    // }

    BModify.getGainMultiplier = function () {
        var mult = 1;
        for (var i in Game.Objects) {
            if (Game.Has(Game.Objects[i].energyTiered)) mult *= 1.33;
        }
        return Math.round((mult + Number.EPSILON) * 100) / 100;
    }

    BModify.getLoss = function () {
        let consumption = 0;
        for (var i in Game.Objects) {
            consumption += Game.Objects[i].baseConsumption * Game.Objects[i].amount * (i == 'Cursor'??this.getCursorDrain())
                * (Game.Has(Game.Objects[i].effTiered) ?? Math.pow(0.96, Game.getTieredUpgradesTotal(Game.Objects[i])));
        }
        if (Game.Has("Specialized chocolate chips")) consumption *= 0.98;
        if (Game.Has("Designer cocoa beans")) consumption *= 0.98;
        if (Game.Has("Underworld ovens")) consumption *= 0.98;
        if (Game.Has("Exotic nuts")) consumption *= 0.98;
        if (Game.Has("Arcane sugar")) consumption *= 0.98;
        if (this.speed >= 3) consumption *= this.speed;
        return Math.round((consumption + Number.EPSILON) * 1000) / 1000;
    }

    BModify.getCursorDrain = function() { // cursor nerf!
        var rateNum = 1;
        if (Game.Has("Thousand fingers")) rateNum*=1.65;
        if (Game.Has("Million fingers")) rateNum*=1.65;
        if (Game.Has("Billion fingers")) rateNum*=1.65;
        if (Game.Has("Trillion fingers")) rateNum*=1.65;
        if (Game.Has("Quadrillion fingers")) rateNum*=1.65;
        if (Game.Has("Quintillion fingers")) rateNum*=1.65;
        if (Game.Has("Sextillion fingers")) rateNum*=1.65;
        if (Game.Has("Septillion fingers")) rateNum*=1.65;
        if (Game.Has("Octillion fingers")) rateNum*=1.65;
        if (Game.Has("Nonillion fingers")) rateNum*=1.65;
        if (Game.Has("Decillion fingers")) rateNum*=1.65;
        if (Game.Has("Undecillion fingers")) rateNum*=1.65;
        return Math.round(rateNum);
    }

    BModify.gainEnergy = function (en, pcMax) {
        var mult = this.getGainMultiplier();
        this.energy += (en * mult + pcMax * this.maxEnergy);
        if (this.energy > this.maxEnergy) this.energy = this.maxEnergy;
    }



    BModify.energyCalc = function () {
        this.consumption = this.getLoss();

        this.production = this.powerPlants;
        if (this.batteryMustRefill) this.production *= 0.7;
        this.production *= this.getGainMultiplier();

        this.baseEfficiency = (this.consumption > 0 ? this.production / this.consumption : 0);
        if (this.energy > 0 || this.batteryPercent > 0) this.baseEfficiency = 1;
        if (this.production >= this.consumption) this.baseEfficiency = 1;

        this.efficiency = this.baseEfficiency;

        this.maxEnergy = 1000;
        this.maxEnergyUp.forEach((up) => {
            if (Game.Has(up)) this.maxEnergy *= 10;
        })


        if (this.batteryMustRefill) {
            this.batteryPercent += (0.007*Math.max(this.production - this.consumption, 0.1*this.production)) / (0.2*this.maxEnergy);
            if (this.batteryPercent >= 1) {
                this.batteryPercent = 1;
                this.batteryMustRefill = false;
            }
        }

        // unlock upgrades
        for (var i in Game.Objects) {
            if (Game.Objects[i].amount >= 4) Game.Unlock(Game.Objects[i].energyTiered);
            if (Game.Objects[i].amount >= 120) Game.Unlock(Game.Objects[i].effTiered);
        }

        if (this.consumption >= 25000 && this.speed >= 3) {this.trackAch[0]++;} else {this.trackAch[0]=0;}
        if (this.consumption >= 200000 && this.speed >= 6) {this.trackAch[1]++;} else {this.trackAch[1]=0;}
        if (this.consumption >= 5000000 && this.speed >= 12) {this.trackAch[2]++;} else {this.trackAch[2]=0;}
        if (this.consumption >= 40000000 && this.speed >= 50) {this.trackAch[3]++;} else {this.trackAch[3]=0;}

        if (this.trackAch[0] > 5*60) Game.Win("Flash");
        if (this.trackAch[1] > 10*60) Game.Win("Lightspeed");
        if (this.trackAch[2] > 15*60) Game.Win("Infinity and beyond");
        if (this.trackAch[3] > 30*60) Game.Win("Through the fourth wall");

        // speed
        if (this.efficiency >= 1 && this.consumption > 5) {
            this.nextInc -= 1;
        } else {
            this.speed -= 0.01;
            this.speed = Math.max(this.speed, 1);
        };
        if (this.nextInc <= 0) {
            this.speed += 0.01;
            this.nextInc = Math.pow(this.speed, 0.5) * 3;
        }

        this.drawP();
    }

    this.ppBSAmnt = 1;

    BModify.drawP = function () {
        // draw power plant widget
        var ident = (this.ppBSAmnt==1?'Power Plant':this.ppBSAmnt+' Power Plants');
        var str = '';

        str += '<div class="listing"><div class="icon" style="float:left;'+writeIcon([16,7])+'"></div>'+
						'<div style="margin-top:8px;"><span class="title" style="font-size:22px;">Power plants: '+Beautify(this.powerPlants)+'</span> '+
                        '<br>producing <b>'+Beautify(this.production)+'</b> energy per second</div>'+
					'</div>';
        //'<div class="title" style="position:relative">Power Plants: ' + Beautify(this.powerPlants) + '</div>';
        str += '<div class="line"></div>';
        str += '<a class="smallFancyButton" ' + Game.clickStr + '="mod.bModify.buyP();"> Buy '+ident+' (<span id="pPriceTag" class="price"></span>) </a>' + '<br>';
        str += '<a class="smallFancyButton" ' + Game.clickStr + '="mod.bModify.ppBSAmnt=1;mod.bModify.drawP();"> 1 </a>';
        str += '<a class="smallFancyButton" ' + Game.clickStr + '="mod.bModify.ppBSAmnt=10;mod.bModify.drawP();"> 10 </a>';
        str += '<a class="smallFancyButton" ' + Game.clickStr + '="mod.bModify.ppBSAmnt=100;mod.bModify.drawP();"> 100 </a>' + '<br>';
        str += '<a class="smallFancyButton" ' + Game.clickStr + '="mod.bModify.sellP();"> Sell '+ident+' (<span id="pSellTag" class="price"></span>) </a>';
        l("pContent").innerHTML = str;

        l("pPriceTag").innerHTML = Beautify(this.getCumulativePrice()) + " cookies";
        if (Game.cookies > this.getCumulativePrice()) l("pPriceTag").classList.remove("disabled");
        else l("pPriceTag").classList.add("disabled");

        l("pSellTag").innerHTML = (this.powerPlants > 0 ? Beautify(this.getCumulativeSellPrice()) : 0) + " cookies";
    }

    BModify.buyP = function () {
        for (var i = 0; i < this.ppBSAmnt; i++) this.buy();
    }

    BModify.sellP = function () {
        for (var i = 0; i < this.ppBSAmnt; i++) this.sell();
    }

    BModify.buy = function () {
        if (Game.cookies < this.getPrice()) return;
        Game.Spend(this.getPrice());
        this.powerPlants++;
        this.drawP();
    }

    BModify.sell = function () {
        if (this.powerPlants == 0) return;
        Game.Earn(this.getSellPrice());
        this.powerPlants--;
        this.drawP();
    }

    const scale = 1.23;

    BModify.getPrice = function () {
        return Math.ceil(100 * Math.pow(scale, this.powerPlants)) * (this.powerPlants + 1);
    }

    BModify.getCumulativePrice = function () {
        var price = 0;
        for (var i = 0; i < this.ppBSAmnt; i++) {
            price += Math.ceil(100 * Math.pow(scale, this.powerPlants + i)) * (this.powerPlants + i + 1);
        }
        return price;
    }

    BModify.getSellPrice = function () {
        return Math.ceil(50 * Math.pow(scale, this.powerPlants - 1)) * (this.powerPlants);
    }

    BModify.getCumulativeSellPrice = function () {
        var amnt = Math.min(this.ppBSAmnt, this.powerPlants - 1);
        var price = 0;
        for (var i = 0; i < amnt; i++) {
            price += Math.ceil(50 * Math.pow(scale, this.powerPlants - i - 1) * (this.powerPlants - i));
        }
        return price;
    }

    BModify.energyUpdate = function () {
        this.energy += (this.production - this.consumption) / Game.fps;
        if (this.energy > this.maxEnergy) this.energy = this.maxEnergy;
        if (this.energy < 0) {
            this.energy = 0;
            if (!this.batteryActive && Research.Has("Nucleonic batteries") && !this.batteryMustRefill) this.batteryActive = true;
        } else this.batteryActive = false;

        if (this.batteryActive) {
            this.batteryPercent -= Math.max(this.consumption - this.production, 0) / (Game.fps*this.maxEnergy*0.2);
            if (this.batteryPercent <= 0) {
                this.batteryPercent = 0;
                this.batteryMustRefill = true;
            }
        }

        // draw ppwidget
        if (Game.cookiesEarned > 1e3 && Game.onMenu == '') l("pWidget").style.display = 'block';
        else l("pWidget").style.display = 'none';
    }

    Game.GetIcon = function (type, tier) {
        var col = 0;
        if (type == 'Kitten') col = 18; else col = Game.Objects[type].iconColumn;
        return (Game.Tiers[tier].source ? [col, Game.Tiers[tier].iconRow, Game.Tiers[tier].source] : [col, Game.Tiers[tier].iconRow]);
    }

    Game.Tiers['Energizium'] = { name: 'Energizium', unlock: 4, iconRow: 17, source: Icons, color: '#57c1ff', special: 1, price: 15 };

    // icon row is gonna be changed eventually! do not worry
    Game.Tiers['Efficentia'] = { name: 'Efficentia', unlock: 100000000, iconRow: 17, source: Icons, color: '#267cae', special: 1, price: 330000000 };

    var order = 18500;

    // probably a javascript-er way to do this but IDRC
    Game.GetTieredUpgradesTotal =function(me)
    {
        var n=0;
        for (var i in me.tieredUpgrades)
        {
            if (!Game.Tiers[me.tieredUpgrades[i].tier].special && Game.Has(me.tieredUpgrades[i].name)) n++;
        }
        return n;
    }

    function EnergyTiered(bid, name, desc) {
        desc = "All energy gains <b>x1.33</b>. " + cfl(Game.ObjectsById[bid].plural) + " gain <b>" + (bid == 0 ? 100 : 200 - bid * 10)
            + "%</b> more CpS from speed.<q>" + desc + "</q>";

        en.ue.addUpgrade(name, desc, Game.Tiers['Energizium'].price * Game.ObjectsById[bid].basePrice * (bid + 1),
            Game.GetIcon(Game.ObjectsById[bid].name, 'Energizium'), order, { tier: 'Energizium' });
        Game.ObjectsById[bid].energyTiered = name;
    }

    function EffTiered(bid, name, desc) {
        desc = cfl(Game.ObjectsById[bid].plural) + " lose <b>4%</b> (multiplicative) energy consumption per tiered upgrade bought. <q>" + desc + "</q>";

        en.ue.addUpgrade(name, desc, Game.Tiers['Efficentia'].price * Game.ObjectsById[bid].basePrice * (bid + 1),
            Game.GetIcon(Game.ObjectsById[bid].name, 'Efficentia'), order, { tier: 'Efficentia' });
        Game.ObjectsById[bid].effTiered = name;
    }

    for (let i=12; i<20; i++) {
        EnergyTiered(i, Game.ObjectsById[i].name + ' power', '... (will make actual upgrades)');
    }

    EnergyTiered(0, "Mouse wheels", "The hamster wheels of the clicking world.");
    EnergyTiered(1, "Elder batteries", "These actually increase in power the older they get.");
    EnergyTiered(2, "Wind turbines", "Wheeeee!");
    EnergyTiered(3, "Coal", "The children yearn for the mines.");
    EnergyTiered(4, "Power facility", "Does not relate to the power plant.");
    EnergyTiered(5, "Compound rates", "Obtaining energy at a roughly 33% interest rate.");
    EnergyTiered(6, "Ancient totem", "Carved inscription 'INSPECTED BY NO. 6'.");
    EnergyTiered(7, "Arcane electrostatics", "An ancient wizardly technique, feared by many.");
    EnergyTiered(8, "The electric universe", "Don't worry if it isn't true - in the next ascension we'll find a parallel universe where it *is* true.");
    EnergyTiered(9, "Cookiemutation", "Look, this isn't even the weirdest thing you've seen this week. It's fine.");
    EnergyTiered(10, "Seven-Eyed God of Thunder", "Available yesterday at a -6.6% discount!");
    EnergyTiered(11, "Time Lord", "Oh, so we're putting shameless surface-level Doctor Who references now? I'm leaving. Bye.");

    // will make actual upgrades
    for (let i=0; i<20; i++) {
        EffTiered(i, 'Efficient '+Game.ObjectsById[i].name, 'Only the latest advances in energy-saving tech!');
    }

    en.newInfoPanel("energyDisp", [3,3,Icons], function(){
        return `<div class="prompt" style="min-width:400px;text-align:center;font-size:11px;margin:8px 0px;"><h3>Energy</h3><div class="line"></div>`
            +'This is the amount of energy you have. Buildings need energy to stay functional, and clicking the big cookie or any golden cookies produces energy.'
            +'<br><b>Energy: '+Beautify(Math.ceil(BModify.energy))+'/'+Beautify(BModify.maxEnergy)+` max</b>`
            +'<div class="line"></div>Your buildings are currently operating at <b>'+Beautify(100*BModify.efficiency)+'%</b> efficiency, giving <b>'
            +Beautify(100*BModify.efficiency)+'%</b> of their maximum CpS output.'
            +`</div>`},"energyTip");
    
    en.newInfoPanel("speedDisp", [12,5], function(){
        return `<div class="prompt" style="min-width:400px;text-align:center;font-size:11px;margin:8px 0px;"><h3>Speed</h3><div class="line"></div>`
            +'This is your <b>speed</b>. Having 100% efficiency for a long period of time causes this to increase.'
            +'<br>Once speed reaches <b>x3</b>, it will also affect energy consumption.'
            +`</div>`},"speedTip");

    en.newInfoPanel("batteryDisp", [3,4,Icons], function(){
        return `<div class="prompt" style="min-width:400px;text-align:center;font-size:11px;margin:8px 0px;"><h3>Nucleonic battery</h3><div class="line"></div>`
            +'This is your <b>battery</b>. It slowly charges energy over time.'
            +'<br>When energy is depleted, the battery will be used.'
            +`</div>`},"batteryTip");

    var expstr = 'Maximum energy multiplied by <b>10</b>.';
    BModify.maxEnergyUp = ['Battery tower', 'Lightning jar', 'Pocket power dimension', 'Save expander'];
    en.ue.addUpgrade('Battery tower', expstr + '<q>Inspired by Universal Paperclips... again? This is lame.</q>', 1e5,
        [0, 4, Icons], order, { unlockAt: 1e5 });
    en.ue.addUpgrade('Lightning jar', expstr + '<q>Now you can catch a lightning bolt!</q>', 1e11,
        [0, 4, Icons], order, { unlockAt: 1e8 });
    en.ue.addUpgrade('Pocket power dimension', expstr + '<q>A dimension completely filled to the brim with energy and paperclips.</q>', 1e14,
        [0, 4, Icons], order, { unlockAt: 1e14 });
    en.ue.addUpgrade('Save expander', expstr + '<q>By the way, I\'m not optimizing the mod\'s savefile anytime soon.</q>', 1e17,
        [0, 4, Icons], order, { unlockAt: 1e20 });

    Game.energyCostTip = function(me) {
        let cost=Game.energyCost(up.name);
        return (Game.hasEnergyCost(me)??'+<span class="price energy'+(context=='store'??(BModify.energy>=cost?'':' disabled'))+'">'
                +Beautify(Math.round(cost))+' energy</span>');
    }

    eval('Game.crateTooltip='+Game.crateTooltip.toString()
         .replace(`if (me.priceLumps==0 && cost==0)`,`if (me.priceLumps==0 && cost==0 && !Game.hasEnergyCost(me))`)
         .replace(`+'</div>';`,`+Game.energyCostTip(me)+'</div>';`)
         .replace(`(me.pool!='prestige' && me.priceLumps==0)`,`(me.pool!='prestige' && me.priceLumps==0  && !Game.hasEnergyCost(me))`));

    Game.UpdateMenu = en.injectCode(Game.UpdateMenu,
        `'<div class="listing"><b>'+loc("Cookie clicks:")+'</b> '+Beautify(Game.cookieClicks)+'</div>'+`,
        `\n\t\t\t\t'<div class="listing"><b>Energy:</b> '+Beautify(mod.bModify.energy)+'/'+Beautify(mod.bModify.maxEnergy)+'</div>'+` +
        `\n\t\t\t\t'<div class="listing"><b>Efficiency:</b> '+Beautify(mod.bModify.efficiency*100)+'%</div>'+` +
        `\n\t\t\t\t'<div class="listing"><b>Consumption per second:</b> '+Beautify(mod.bModify.consumption,1)+'</div>'+` +
        `\n\t\t\t\t'<div class="listing"><b>Production per second:</b> '+Beautify(mod.bModify.production,1)+'</div>'+`, "after"
    )

    Game.ClickCookie = en.injectCode(Game.ClickCookie, "Game.loseShimmeringVeil('click');", "mod.bModify.gainEnergy(10,0);", "after");
    eval('Game.shimmerTypes.golden.popFunc=' + Game.shimmerTypes.golden.popFunc.toString().replace("var buff=0;",
        "var buff=0; \n\t\tmod.bModify.gainEnergy((me.spawnLead?250:30),(me.spawnLead?0.05:0.001));"
    ));

    // POWER PLANTS

    l('rows').insertAdjacentHTML('afterbegin',
        '<div id="pWidget" style="position:relative;padding-bottom:16px;width:100%;height:256px;background:url(' + Game.resPath + 'img/shadedBorders.png),url(' + Game.resPath + 'img/darkNoise.jpg);">'
        + '<div class="separatorBottom"></div>' + '<div id="pContent" style="padding:24px;"></div></div>');

    en.trackVars(this, [["energy"], ["maxEnergy"], ["consumption", "float"], ["production", "float"], ["baseEfficiency", "float"],
    ["efficiency", "float"], ["stress", "float"], ["speed", "float"], ["powerPlants"]]);

    var sstr = '<style>'
        + '.resBar{max-width:95%;margin:4px auto;height:16px;}'
        + '.resBarRefill{cursor:pointer;width:48px;height:48px;position:absolute;z-index:1000;transition:transform 0.05s;transform:scale(0.8);}'
        + '.resBarRefill:hover{transform:scale(1.3);}'
        + '.resBarRefill:active{transform.scale(0.7);}'
        + '.barRefillL{left:-40px;top:-17px;}'
        + '.barRefillR{left:340px;top:-17px;}'
        + '.energy.price:before{width:48px;height:48px;left:-20px;top:-14px;'+writeIcon([4, 4, Icons])+'transform:scale(0.5);}'
        + '.rlIcon{' + writeIcon([3, 0, Icons]) + '}'
        + '.rrIcon{' + writeIcon([2, 0, Icons]) + '}' // not fully sure why right:-40px doesn't work; think it's something about overriding
        + '.resBarFull{transform:scale(1,2);transform-origin:50% 0;height:50%;}'
        + '.resBarText{transform:scale(1,0.8);width:100%;position:absolute;left:0px;top:0px;text-align:center;color:#fff;text-shadow:-1px 1px #000,0px 0px 4px #000,0px 0px 6px #000;margin-top:2px;}'
        + '.resBarInfo{text-align:center;font-size:11px;margin-top:15px;color:rgba(255,255,255,0.75);text-shadow:-1px 1px 0px #000;}'
        + '.statsBG{background:url(' + Game.resPath + 'img/shadedBorders.png),url(' + Game.resPath + 'img/darkNoise.jpg);background-size:33% 100%,auto;position:relative;left:0px;right:0px;top:0px;bottom:16px;}'
        + '.separatorTop{width: 100%;height: 8px;background: url(img/panelHorizontal.png?v=2) repeat-x;background: url(img/panelGradientLeft.png) no-repeat top left, '
        + 'url(img/panelGradientRight.png) no-repeat top right, url(img/panelHorizontal.png?v=2) repeat-x;position: absolute;left: 0px;top: 0px;}'
        + '</style>';
    //<div id="buildingBG2" style="position:absolute;left:42px;top:58px;background-position:0px -1152px;opacity:50%;background-image:url('img/buildings.png');width:64px;height:64px;transform:scale(2.625);"></div>
    l("centerArea").insertAdjacentHTML('beforeend', sstr)

    BModify.loadRS = function (str) {
        str.split('&').forEach((me, index) => {
            BModify.rsManagers[index].loadSave(me);
        })
    }

    BModify.writeRS = function () {
        var toCompress = [];
        this.rsManagers.forEach((me) => {
            toCompress.push(me.writeSave());
        })
        return toCompress.join('&');
    }

    BModify.RS_Manager = function (id, baseRS, rsNames) {
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
        this.getBaseRsMax = function () { return this.baseRs * 5 * Math.pow(20 - this.id, 0.3); }
        this.rsUsed = 0;

        this.depleted = false;
        this.pause = false;
        this.statsView = false;
        this.barred = 0;

        //en.trackVars(this, [["RhpS", "float"], ["yield", "float"], ["rsTotal"], ["rsUsed"], ["pause"], ["statsView"]], this.id);

        BModify.rsManagers.push(this);

        this.getRawCpS = function () {
            var cps = this.RhpS * this.yield * this.decayedFactor();
            var dmult = 1;
            if (this.depleted || this.pause)
                dmult = 0;
            if ((this.id == 2) && Research.Has("Regrowth")) dmult = 1;
            return cps * dmult * Game.magicCpS(this.me.name);
        }

        // overwrites vanilla cps function for building
        this.me.cps = function (me) {
            me.rsManager.recalculate();
            return me.rsManager.getRawCpS();
        };

        this.loadSave = function(str) {
            var sstr = str.split(' ');
            this.RhpS = sstr[0];
            this.yield = sstr[1];
            this.rsTotal = sstr[2];
            this.rsUsed = sstr[3];
            this.pause = sstr[4];
            this.statsView = sstr[5];
        }

        this.writeSave = function() {
            return this.RhpS + ' ' + this.yield + ' ' + this.rsTotal + ' ' + this.rsUsed + ' ' + this.pause + ' ' + this.statsView;
        }

        // called once every calculateGains()
        this.recalculate = function () {
            var me = this.me;
            var rhpsmult = 1;
            var rsmult = 1;
            var yieldmult = 1;
            for (var i in me.tieredUpgrades) {
                if (!Game.Tiers[me.tieredUpgrades[i].tier].special && Game.Has(me.tieredUpgrades[i].name)) {
                    var tierMult = 2;
                    if (Game.ascensionMode != 1 && Game.Has(me.unshackleUpgrade) && Game.Has(Game.Tiers[me.tieredUpgrades[i].tier].unshackleUpgrade)) {
                        tierMult += me.id == 1 ? 0.5 : (20 - me.id) * 0.1;
                    }
                    yieldmult *= tierMult;
                    rsmult *= 1.2;
                }
            }
            rsmult *= BModify.idleverse.resourceMult();

            for (var i in me.synergies) {
                var syn = me.synergies[i];
                if (Game.Has(syn.name)) {
                    if (syn.buildingTie1.name == me.name) yieldmult *= (1 + 0.05 * syn.buildingTie2.amount);
                    else if (syn.buildingTie2.name == me.name) yieldmult *= (1 + 0.001 * syn.buildingTie1.amount);
                }
            }

            if (me.fortune && Game.Has(me.fortune.name)) yieldmult *= 1.07;
            yieldmult *= (1 + BModify.grandma.grandmaTypes['G' + me.id].buildingBuff());
            if ((this.id == 2) && Research.Has("Regrowth")) {
                yieldmult *= 3;
                if (this.barred > 0) yieldmult *= 12; // secret feature
            }
            yieldmult *= (1 + 0.025 * Game.Objects.Farm.getLumpBuff());

            // if (me.tieredResearch) {
            //     if (Research.HasTiered(this.id, 1)) rsmult *= 2;
            //     if (Research.HasTiered(this.id, 2)) rsmult *= 2;
            //     if (Research.HasTiered(this.id, 3)) rsmult *= 2;
            //     if (Research.HasTiered(this.id, 1)) yieldmult *= (2 - 0.05 * this.id);
            //     if (Research.HasTiered(this.id, 2)) yieldmult *= (2 - 0.05 * this.id);
            //     if (Research.HasTiered(this.id, 3)) yieldmult *= (2 - 0.05 * this.id);
            // }
            if (Game.hasGod) {
                var godLvl = Game.hasGod('industry');
                if (godLvl == 1) rhpsmult *= 1.3;
                if (godLvl == 2) rhpsmult *= 1.2;
                if (godLvl == 3) rhpsmult *= 1.1;
                var godLvl = Game.hasGod('creation');
                if (godLvl == 1) { rhpsmult *= 0.75; yieldmult *= 1.08; }
                if (godLvl == 2) { rhpsmult *= 0.80; yieldmult *= 1.06; }
                if (godLvl == 3) { rhpsmult *= 0.85; yieldmult *= 1.04; }
            }
            if (Game.Has("Lateral expansions")) rsmult *= 1.5;
            if (Game.Has("Growth ray")) rsmult *= 1.5;
            if (Game.Has("Shrink ray")) rsmult *= 1.5;

            this.yield = this.baseYield * yieldmult;
            this.RhpS = this.baseRhpS * rhpsmult;
            this.rsTotal = this.baseRs * rsmult;
            this.update();
        }

        // decay factor applied to rhps
        this.decayedFactor = function () {
            return Math.pow(0.998, Math.min(this.me.amount, 600));
        }

        this.availableRes = function () { return this.rsTotal - this.rsUsed; }

        // this.gainRes = function(amnt){
        //     var num=Math.min(amnt, this.rsMax-this.rsTotal);
        //     this.update();
        //     this.rsTotal+=num;
        //     return num;
        // }
        // this.loseRes = function(amnt){
        //     var num=Math.min(amnt, this.availableRes()*0.9);
        //     this.update();
        //     this.rsTotal-=num;
        //     return num;
        // }

        // called once per Game.Logic loop
        this.harvest = function () {
            if (this.availableRes() <= 0) {
                if (!this.depleted) Game.recalculateGains = 1;
                this.depleted = true;
            } else this.depleted = false;
            this.rsUsed = Math.min(this.rsUsed, this.rsTotal);
            if ((this.id == 2) && Research.Has("Regrowth")) return;
            if (this.depleted) return;
            if (this.pause) {
                var rate = 0.001 * this.decayedFactor()
                    * (Math.max(this.availableRes() / this.rsTotal, 0.1))
                    * Math.sqrt(BModify.grandma.grandmaTypes['healer'].allocated);
                this.rsUsed -= (rate / Game.fps) * this.rsTotal;
                this.rsUsed = Math.max(this.rsUsed, 0);
                return;
            } else if (this.barred < 0) {
                var dep = (this.RhpS / Game.fps) * this.me.amount * this.decayedFactor();
                // this.rsUsed += dep;
                // BModify.totalDp += dep;
            }
            this.barred--;
        }

        // resets everythin'
        this.clear = function () {
            this.baseYield = this.me.baseCps / baseRhpS_C;
            this.yield = this.baseYield;

            this.baseRhpS = baseRhpS_C; // resource harvest rate
            this.RhpS = this.baseRhpS;

            this.rsTotal = this.baseRs;
            this.rsUsed = 0;

            this.depleted = false;
            this.switch(false);
            this.switchStats(false);
        }

        // whatever this is



        l("productMinigameButton" + this.id).insertAdjacentHTML('afterend',
            '<div id="productStatsButton' + this.id + '" class="productButton" onclick="Game.ObjectsById[' + this.id + '].rsManager.switchStats(-1)">View Stats</div>');
        // l("productMinigameButton"+this.id).insertAdjacentHTML('afterend', 
        //     '<div id="pauseButton'+this.id+'" class="productButton" onclick="Game.ObjectsById['+this.id+'].rsManager.switch(-1)">Pause</div>');
        l("row" + this.id).insertAdjacentHTML('beforeend',
            '<a id="pauseButton' + this.id + '" class="smallFancyButton framed" style="position:absolute;z-index:10;right:8px;bottom:22px;"' +
            ' onclick="Game.ObjectsById[' + this.id + '].rsManager.switch(-1)">' + loc("Pause") + '</a>'
        )

        l("row" + this.id).insertAdjacentHTML('beforeend',
            '<div id="rowStats' + this.id + '" style="display: none"></div>'
        )


        this.activButton = l("productStatsButton" + this.id);
        this.statDiv = l("rowStats" + this.id);
        this.statDiv.insertAdjacentHTML('beforeend', '<div id="statsBG' + this.id + '" class="statsBG"></div>')
        l('statsBG' + this.id).insertAdjacentHTML('beforeend', '<div id="stats' + this.id + '" class="subsection"></div>')
        l('stats' + this.id).insertAdjacentHTML('beforeend', '<div class="separatorTop"/>')
        l('stats' + this.id).insertAdjacentHTML('beforeend', '<div class="title" style="position:relative">' + cfl(this.me.plural) + '</div>')
        l('stats' + this.id).insertAdjacentHTML('beforeend', '<div id="statsListing' + this.id + '"></div>')
        l('stats' + this.id).insertAdjacentHTML('beforeend', '<div id="statsVisual' + this.id + '"></div>')

        var str = '';
        str += '<div id="resBar' + this.id + '"' + Game.getDynamicTooltip('Game.ObjectsById[' + this.id + '].rsManager.infoTooltip', 'this') + ' class="resBar smallFramed meterContainer" style="width:1px;">'
        str += '<div id="resBarRefillL' + this.id + '"' + Game.getDynamicTooltip('Game.ObjectsById[' + this.id + '].rsManager.refillTooltipL', 'this') + ' class="shadowFilter resBarRefill barRefillL rlIcon"></div>'
        str += '<div id="resBarRefillR' + this.id + '"' + Game.getDynamicTooltip('Game.ObjectsById[' + this.id + '].rsManager.refillTooltipR', 'this') + ' class="shadowFilter resBarRefill barRefillR rrIcon"></div>'
        str += '<div id="resBarFull' + this.id + '" class="resBarFull meter filling" style="width:1px;"></div>'
        str += '<div id="resBarText' + this.id + '" class="resBarText titleFont"></div>'
        str += '<div id="resBarInfo' + this.id + '" class="resBarInfo"></div>'
        str += '</div>'
        l('statsVisual' + this.id).innerHTML = str;

        this.mbarFull = l("resBarFull" + this.id);
        this.mbar = l("resBar" + this.id);
        this.mbarText = l("resBarText" + this.id);
        this.mbarInfo = l("resBarInfo" + this.id);
        this.refillL = l("resBarRefillL" + this.id);
        this.refillR = l("resBarRefillR" + this.id);

        this.switchStats = function (on) {
            if (this.me.onMinigame) return;
            if (on == -1) on = !this.statsView;
            this.statsView = on;
            if (this.statsView) {
                this.statDiv.style.display = 'block';
                this.activButton.textContent = loc("Close Stats");
            } else {
                this.statDiv.style.display = 'none';
                this.activButton.textContent = loc("View Stats");
            }
        }

        this.switch = function (on) {
            if (on == -1) on = !this.pause;
            this.pause = on;
            if (this.pause) {
                l('pauseButton' + this.id).textContent = loc("Start");
            } else {
                l('pauseButton' + this.id).textContent = loc("Pause");
            }
            Game.recalculateGains = 1;
        }

        this.me.switchMinigame = en.injectCode(this.me.switchMinigame, `l('row'+this.id).classList.add('onMinigame');`,
            `this.rsManager.statDiv.style.display='none';`, "after");

        this.me.switchMinigame = en.injectCode(this.me.switchMinigame, `l('row'+this.id).classList.remove('onMinigame');`,
            `this.rsManager.statDiv.style.display=this.rsManager.statsView ? 'block' : 'none';`, "after");


        this.update = function () {
            this.draw();
            str = '';
            var sty = '';
            if (this.pause) sty = 'style="color:cyan"';
            if (this.depleted) sty = 'style="color:red"';
            str += '<div class="listing" ' + sty + '> <b>' + this.rsNames[0] + ' use rate (' + this.rsNames[2] + '/second) per ' + this.me.dname.toLowerCase() + ': </b>' +
                Beautify((this.pause || this.depleted) ? 0 : this.RhpS, 1);
            str += ' (' + Beautify(this.RhpS * this.me.amount * this.decayedFactor()) + ' for ' + Beautify(this.me.amount) + ' ' + this.me.plural.toLowerCase();
            str += ')</div>';

            str += '<div class="listing"> <b>Base yield: </b>' + Beautify(this.yield, 1) + " cookies/" + this.rsNames[1] + '</div>';
            str += '<div class="listing"> <b>Total amount of ' + this.rsNames[0].toLowerCase() + ' discovered:</b> ' + Beautify(this.rsTotal) + " " + this.rsNames[2] + '</div>';
            str += '<div class="listing"> <b>Used ' + this.rsNames[0].toLowerCase() + ' so far:</b> ' + this.rsUsed + " " + this.rsNames[2] + '</div>';
            // str+='<div class="listing" '+sty+'> <b>Base CpS:</b> '+Beautify(this.getRawCpS()*this.me.amount, 1)+" cookies/second"+'</div>';
            // str+='<div class="listing" '+sty+'> <b>CpS:</b> '+Beautify(this.me.storedTotalCps*Game.globalCpsMult, 1)+" cookies/second"+'</div>';
            l('statsListing' + this.id).innerHTML = str;
            if (Game.Objects.Bank.minigame) this.refillR.style.display = 'inline';
            else this.refillR.style.display = 'none';
        }

        this.infoTooltip = function () {
            var str = "This is your <b>resource meter</b>. It displays the percentage of resource that you have left.";
            str += "<br>When your resource meter is <b>depleted</b>, this building will stop producing CpS.";
            return '<div style="padding:8px;width:300px;font-size:11px;text-align:center;">' + str + '</div>';
        }

        this.refillTooltipL = function () {
            var str = "Click to <b>refill available resources by 35%</b> and prevent depletion for <b>1 minute</b> for <b>60%</b> of your max power clicks.";
            return '<div style="padding:8px;width:300px;font-size:11px;text-align:center;">' + str + '</div>';
        }

        this.refillPrice = function () {
            var price = 300000 + Math.min(Game.Objects.Cursor.level, 12) * 25000;
            if (this.depleted) price *= 2.5;
            return price;
        }
        this.refillTooltipR = function () {
            // if (!Game.Objects.Bank.minigame) return '';
            // var col = (Game.Objects.Bank.minigame.profit >= this.refillPrice()) ? '#73f21e' : '#f21e3c';
            // var str = "Click to <b>refill available resources by 50%</b> for <span style='color:"+col+";'>$"+this.refillPrice()+"</span>.";
            // str += "<br>However, this will cause resources to deplete <b>50%</b> faster for <b>20 minutes</b> without any CpS boost.";

            // str += (BModify.bankRefill>0?"<br><small class='red'>(usable again in "+Game.sayTime(BModify.bankRefill+Game.fps, -1)+")</small>"
            //     :"<br><small>(Cooldown time upon use: "+(this.depleted?"<span class='red'>3 hours</span>":"1 hour")+")</small>");
            return '<div style="padding:8px;width:300px;font-size:11px;text-align:center;"></div>';
        }

        AddEvent(this.refillL, 'click', function () {
            if (!Game.Has("Power gate")) return;
            var me = Game.ObjectsById[id].rsManager;
            if (mod.clicks.powerClicks < 0.6 * mod.clicks.getMaxPowerClicks()) return;
            me.rsUsed -= 0.5 * me.rsTotal;
            me.rsUsed = Math.max(me.rsUsed, 0);
            me.rsAvailable = me.rsTotal - me.rsUsed;
            me.update();
            Game.recalculateGains = 1;
            me.barred = Game.fps * 60;
            mod.clicks.powerClicks -= 0.6 * mod.clicks.getMaxPowerClicks();
            PlaySound('snd/pop' + Math.floor(Math.random() * 3 + 1) + '.mp3', 0.75);
        });

        AddEvent(this.refillR, 'click', function () {
            // if (!Game.Objects.Bank.minigame) return;
            // var me = Game.ObjectsById[id].rsManager;
            // var mini = Game.Objects.Bank.minigame;
            // if ((mini.profit >= me.refillPrice()) && (BModify.bankRefill<=0)) {
            //     mini.profit -= me.refillPrice();
            //     me.rsUsed -= 0.5 * me.rsTotal;
            //     me.rsUsed = Math.max(me.rsUsed, 0);
            //     me.rsAvailable = me.rsTotal - me.rsUsed;
            //     me.update();
            //     Game.recalculateGains = 1;
            //     PlaySound('snd/pop'+Math.floor(Math.random()*3+1)+'.mp3',0.75);
            // }
        });

        this.draw = function () {
            if (Game.drawT % 5 == 0) {
                this.mbarFull.style.width = Math.max(Math.round((this.availableRes() / this.rsTotal) * 100), 0) + '%';
                if (this.barred)
                    if ((this.id == 2) && Research.Has("Regrowth")) this.mbar.style.background = 'lightGreen';
                this.mbar.style.width = '350px';
                this.mbarText.innerHTML = Beautify(Math.max((this.availableRes() / this.rsTotal) * 100, 0), 1) + '% left';
                if (this.depleted) this.mbarInfo.innerHTML = 'This resource has been depleted';
                else if (this.pause) this.mbarInfo.innerHTML = 'Currently paused';
                else if (this.barred > 0) this.mbarInfo.innerHTML = 'This resource is under the effects of the Power gate';
                else if ((this.id == 2) && Research.Has("Regrowth")) this.mbarInfo.innerHTML = 'Regrowth is currently active.';
                else this.mbarInfo.innerHTML = 'Depletion rate: -'
                    + Beautify(Math.max(((this.RhpS * this.me.amount * this.decayedFactor()) / this.rsTotal) * 100, 0), 2) + '%/s (-'
                    + Beautify(Math.max(((this.RhpS * this.me.amount * this.decayedFactor()) / this.rsTotal) * 100 * 60, 0), 2) + '%/min)';
            }
            this.mbarFull.style.backgroundPosition = (-Game.T * 0.5) + 'px';
        }

        for (var i in this.me.tieredUpgrades) {
            if (!Game.Tiers[this.me.tieredUpgrades[i].tier].special) {
                en.ue.appendToDesc(this.me.tieredUpgrades[i],
                    "<br>Total " + this.rsNames[0].toLowerCase() + " <b>+20%</b>.");
            }
        }
    }

    BModify.RS_Manager.prototype.getType = function () {
        return 'RS_Manager';
    }

    BModify.gateTooltip = function () {
        var str = "Click to <b>refill available resources by 10%</b> and prevent depletion for <b>5 minutes</b> for <b>" + this.gateCost() + "</b> power clicks.";
        return '<div style="padding:8px;width:300px;font-size:11px;text-align:center;">' + str + '</div>';
    }

    BModify.gateCost = function () { return Math.floor(mod.clicks.getMaxPowerClicks() * 0.4); }

    BModify.gate = function () {
        if (mod.clicks.powerClicks < this.gateCost()) return;
        this.rsManagers.forEach((me) => {
            me.rsUsed -= 0.1 * me.rsTotal;
            me.rsUsed = Math.max(me.rsUsed, 0);
            me.rsAvailable = me.rsTotal - me.rsUsed;
            me.update();
            Game.recalculateGains = 1;
            me.barred = Game.fps * 60 * 5;
            mod.clicks.powerClicks -= this.gateCost();
            PlaySound('snd/pop' + Math.floor(Math.random() * 3 + 1) + '.mp3', 0.75);
        })
    }

    const UpdateTicks = 10;

    BModify.Grandmas = function () {
        this.me = Game.Objects['Grandma'];
        var grandmaM = this;

        l("productMinigameButton1").insertAdjacentHTML('afterend',
            '<div id="grandmaSwitch" class="productButton" onclick="mod.bModify.grandma.switchStats(-1)">' + loc('View Manager') + '</div>');
        l("row1").insertAdjacentHTML('beforeend', '<div id="grandmaManagerDiv" style="display: none"></div>');

        this.activButton = l("grandmaSwitch");
        this.statDiv = l("grandmaManagerDiv");

        // copypasted the Grimoire spell layout
        var str = '';
        str += '<style>'
            + '#grandmaManagerBG{background:url(' + Game.resPath + 'img/shadedBorders.png),url(' + Game.resPath + 'img/darkNoise.jpg);background-size:33% 100%,auto;position:relative;left:0px;right:0px;top:0px;bottom:16px;}'
            + '.separatorTop{width: 100%;height: 8px;background: url(img/panelHorizontal.png?v=2) repeat-x;background: url(img/panelGradientLeft.png) no-repeat top left, '
            + 'url(img/panelGradientRight.png) no-repeat top right, url(img/panelHorizontal.png?v=2) repeat-x;position: absolute;left: 0px;top: 0px;}'
            + '#grandmaManager{text-align:center;}'
            + '#grandmaTypes{text-align:center;width:100%;padding:8px;box-sizing:border-box;}' +
            '.grandmaIcon{pointer-events:none;margin:2px 6px 0px 6px;width:48px;height:48px;opacity:0.8;position:relative;}' +
            '.grandmaTypeInfo{pointer-events:none;}' +
            '.grandmaType{box-shadow:4px 4px 4px #000;cursor:pointer;position:relative;color:#f33;opacity:0.8;text-shadow:0px 0px 4px #000,0px 0px 6px #000;font-weight:bold;font-size:12px;display:inline-block;width:60px;height:74px;background:url(' + Game.resPath + 'img/spellBG.png);}' +
            '.grandmaType.ready{color:rgba(255,255,255,0.8);opacity:1;}' +
            '.grandmaType.ready:hover{color:#fff;}' +
            '.grandmaType:hover{box-shadow:6px 6px 6px 2px #000;z-index:1000000001;top:-1px;}' +
            '.grandmaType:active{top:1px;}' +
            '.grandmaType.ready .grandmaIcon{opacity:1;}' +
            '.grandmaType:hover{background-position:0px -74px;} .grandmaType:active{background-position:0px 74px;}' +
            '.grandmaType:nth-child(4n+1){background-position:-60px 0px;} .grandmaType:nth-child(4n+1):hover{background-position:-60px -74px;} .grandmaType:nth-child(4n+1):active{background-position:-60px 74px;}' +
            '.grandmaType:nth-child(4n+2){background-position:-120px 0px;} .grandmaType:nth-child(4n+2):hover{background-position:-120px -74px;} .grandmaType:nth-child(4n+2):active{background-position:-120px 74px;}' +
            '.grandmaType:nth-child(4n+3){background-position:-180px 0px;} .grandmaType:nth-child(4n+3):hover{background-position:-180px -74px;} .grandmaType:nth-child(4n+3):active{background-position:-180px 74px;}' +
            '.grandmaType:hover .grandmaIcon{top:-1px;}' +
            '.grandmaType.ready:hover .grandmaIcon{animation-name:bounce;animation-iteration-count:infinite;animation-duration:0.8s;}' +
            '.noFancy .grandmaType.ready:hover .grandmaIcon{animation:none;}'
            + '</style>';

        this.statDiv.insertAdjacentHTML('beforeend', '<div id="grandmaManagerBG"></div>')
        l('grandmaManagerBG').insertAdjacentHTML('beforeend', '<div id="grandmaManagerWrapper" class="subsection"></div>')
        l('grandmaManagerWrapper').insertAdjacentHTML('beforeend', str)
        l('grandmaManagerWrapper').insertAdjacentHTML('beforeend', '<div class="separatorTop"/>')
        l('grandmaManagerWrapper').insertAdjacentHTML('beforeend', '<div class="title" style="position:relative">' + cfl(this.me.plural) + '</div>')
        l('grandmaManagerWrapper').insertAdjacentHTML('beforeend', '<div id="grandmaManager" style="overflow:auto"></div>')

        this.allocT = 0;
        this.grandmaTypes = {};
        this.storage = 0;

        this.anger = 0;

        // make Pledge and Covenant cost Energy
        Game.hasEnergyCost = function(up) {
            return up.name=="Elder Pledge"||up.name=="Elder Covenant";
        }

        Game.energyCost = function(up) {
            if (up.name=="Elder Pledge") return 4666666*Math.pow(1.3,Math.min(Game.pledges,12));
            if (up.name=="Elder Covenant") return 16666666;
        }
        // slight change here: instead of Covenant being buyable during Pledge only, you have to have Pledge inactive for it to be buyable.

        // all of this is intended to make GPOC a bit more permanent.
        eval('Game.UpdateGrandmapocalypse='+Game.UpdateGrandmapocalypse.toString()
             .replaceAll("Game.Lock('Elder Pledge');","Game.Lock('Elder Pledge');Game.Lock('Elder Covenant');")
             .replaceAll("Game.Unlock('Elder Pledge');","Game.Unlock('Elder Pledge');Game.Unlock('Elder Covenant');"));
        Game.Upgrades['Elder Pledge'].canBuyFunc=function(){return BModify.energy>=Game.energyCost(this) && Game.cookies>=this.getPrice()};
        Game.Upgrades['Elder Pledge'].buyFunc=function(){
            Game.elderWrath=0;
            BModify.grandma.anger=Math.max(0,BModify.grandma.anger-0.22);
            BModify.energy-=Game.energyCost('Elder Pledge');
            Game.pledges++;
            Game.pledgeT=Game.getPledgeDuration();
            Game.Lock('Elder Covenant');
            Game.CollectWrinklers();
            Game.storeToRefresh=1;
        }

        Game.Upgrades['Elder Covenant'].canBuyFunc=function(){return BModify.energy>=Game.energyCost(this) && Game.cookies>=this.getPrice() && Game.pledgeT<=0};
        Game.Upgrades['Elder Covenant'].buyFunc=function(){
            BModify.energy-=Game.energyCost('Elder Covenant');
            Game.Lock('Revoke Elder Covenant');
            Game.Unlock('Revoke Elder Covenant');
            Game.Lock('Elder Pledge');
            Game.Win('Elder calm');
            Game.CollectWrinklers();
            Game.storeToRefresh=1;
        }

        Game.getPledgeDuration=function(){return Game.fps*60*(Game.Has('Sacrificial rolling pins')?5:2.5);}

        en.ue.appendToDesc(Game.Upgrades['Specialized chocolate chips'], '<b>-2%</b> energy consumption.');
        en.ue.appendToDesc(Game.Upgrades['Designer cocoa beans'], '<b>-2%</b> energy consumption.');
        en.ue.appendToDesc(Game.Upgrades['Underworld ovens'], '<b>-2%</b> energy consumption.');
        en.ue.appendToDesc(Game.Upgrades['Exotic nuts'], '<b>-2%</b> energy consumption.');
        en.ue.appendToDesc(Game.Upgrades['Arcane sugar'], '<b>-2%</b> energy consumption.');
        // sorry
        en.ue.replaceDescPart(Game.Upgrades['Elder Covenant'], '-5%', '-20%');
        eval('Game.CalculateGains='+Game.CalculateGains.toString().replace("if (Game.Has('Elder Covenant')) mult*=0.95;", "if (Game.Has('Elder Covenant')) mult*=0.8;"));

        this.newGrandmaType = function (name, lname, reqFunc, maxFunc, sprite, desc) {
            var grandmaType = {
                name: name,
                lname: lname,
                reqFunc: reqFunc,
                maxFunc: maxFunc,
                sprite: sprite,
                desc: desc,
                unlocked: false,
                allocated: 0,
                alloc: function () {
                    if (!this.unlocked) return;
                    if (grandmaM.allocT >= grandmaM.maxFree()) return;
                    this.allocated += 1;
                    if (this.allocated > this.maxFunc()) this.allocated = this.maxFunc();
                    else grandmaM.allocT += 1;
                    grandmaM.update();
                    grandmaM.draw();
                    Game.recalculateGains = 1;
                },
                remove: function () {
                    if (!this.unlocked) return;
                    if (this.allocated <= 0) return;
                    this.allocated -= 1;
                    grandmaM.allocT -= 1;
                    grandmaM.update();
                    grandmaM.draw();
                    Game.recalculateGains = 1;
                },
                tooltip: function () {
                    var str = '<div style="padding:8px 4px;min-width:350px;">' +
                        '<div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;' + writeIcon(this.sprite) + '"></div>' +
                        '<div class="name">' + this.lname + '</div>' +
                        (this.unlocked ? '<div>Currently allocated: <b>' + this.allocated + '/' + this.maxFunc() + '</b></div>' +
                            '<div>Click to allocate a grandma, Shift-click to remove.</div>' +
                            '<div class="line"></div><div class="description"><b>' + loc("Effect:") + '</b> <span class="green">' + this.desc + '</span></div></div>' :
                            '<div>You do not have this grandma type yet.</div>');
                    return str;
                },
                getRawHTML: function () {
                    return '<div class="grandmaType titleFont" id="grandmaType' + this.name + '" ' +
                        Game.getDynamicTooltip('mod.bModify.grandma.grandmaTypes[`' + this.name + '`].tooltip', 'this') +
                        '><div class="usesIcon shadowFilter grandmaIcon" style="' + writeIcon(this.sprite) + '"></div>' +
                        '<div class="grandmaTypeInfo" id="grandmaTypeInfo' + this.name + '">-</div></div>';
                },
                getMainElement: function () {
                    return l("grandmaType" + this.name);
                },
                getInfoElement: function () {
                    return l("grandmaTypeInfo" + this.name);
                },
                save: function () {
                    en.setVar(this.name + "grandmaAlloc", this.allocated);
                },
                load: function () {
                    this.allocated = en.getVar(this.name + "grandmaAlloc", this.allocated);
                },
                reset: function () {
                    this.allocated = 0;
                },
                update: function () { },
                upkeep: function () { return true; },
            }
            en.newVar(name + "grandmaAlloc", "int");
            this.grandmaTypes[name] = grandmaType;
            return grandmaType;
        }

        this.switchStats = function (on) {
            if (on == -1) on = !this.statsView;
            this.statsView = on;
            if (this.statsView) {
                this.statDiv.style.display = 'block';
                this.activButton.textContent = loc("Close Manager");
            } else {
                this.statDiv.style.display = 'none';
                this.activButton.textContent = loc("View Manager");
            }
        }

        this.maxFree = function () {
            return 5 + 5 * this.storage;
        }

        for (var i = 0; i < 18; i++) {
            var me = this.newGrandmaType("G" + (i + 2), Game.ObjectsById[i + 2].grandma.name,
                (me) => Game.Has(me.buildingTie.grandma.name),
                function () {
                    return Math.ceil(grandmaM.maxFree() * 0.1);
                }, [spr_ref[i + 2], 0], cfl(Game.ObjectsById[i + 2].plural) + " gain <b>+50%</b> CpS per " +
            (i == 0 ? " grandma." : (i + 1) + " grandmas."));
            me.buildingTie = Game.ObjectsById[i + 2];
            en.ue.replaceDescPart(me.buildingTie.grandma,
                loc("%1 are <b>twice</b> as efficient.", cap(Game.Objects['Grandma'].plural)) + ' Unlocks a <b>new grandma type</b>')
            me.buildingBuff = function () { return (0.5 / (this.buildingTie.id - 1)) * this.allocated; }
        }

        // scientist grandmas
        const BaseResearchTime = Game.fps * 60 * 60;
        var sci = this.newGrandmaType("scientist", "Grandma researchers", (me) => Research.Has("Interns"),
            function () { return Math.ceil(grandmaM.maxFree() * 0.2) }, [1, 0, Icons],
            "You passively gain research.");
        sci.nextResearch = BaseResearchTime;
        sci.update = function () {
            if (this.allocated > 0) {
                this.nextResearch -= 1;
                if (this.nextResearch <= 0) {
                    Research.earn(1);
                    this.nextResearch = (BaseResearchTime) / Math.sqrt(this.allocated);
                }
            }
        }

        // healer grandmas
        this.newGrandmaType("healer", "Healer grandmas", (me) => true,
            function () { return Math.ceil(grandmaM.maxFree() * 0.25) }, [3, 1, Icons],
            "Used resource is converted into available resource while buildings are paused. Speed is faster the more grandmas you have.");

        // // explorer grandmas
        // this.newGrandmaType("explorer", "Explorer grandmas", (me) => true,
        //     function(){return Math.ceil(grandmaM.maxFree()*0.25)}, [3, 2, Icons], 
        //     "You can send these grandmas on an exploration trip to collect resources and other goodies.");


        str = '';
        str += '<div><b>Free grandmas</b> are grandmas not currently producing cookies. You can allocate them to do specific tasks.</div>';
        str += '<div>You gain free grandmas by building retirement homes, which attract grandmas.</div>';
        str += '<div>You have <span id="grandmaInfo1"></span> free grandmas, <span id="grandmaInfo2"></span> of which are currently allocated as grandma types.</div>';
        str += '<div><b><span id="grandmaAnger"></span></div>';
        str += '<div>You have <span id="storage"></span></div>';
        str += '<div id="storageBuilder"></div>';
        str += '<div id="grandmaTypes">';
        for (var i in this.grandmaTypes) {
            str += this.grandmaTypes[i].getRawHTML();
        }
        str += '</div>';
        l("grandmaManager").innerHTML = str;
        l('storageBuilder').innerHTML = '<div class="line"></div>' +
            '<div class="optionBox" style="margin-bottom:0px;"><a style="line-height:80%;" class="option framed large title" ' + Game.clickStr + '="mod.bModify.grandma.upgradeStorage();">' +
            '<div style="display:table-cell;vertical-align:middle;">Build a retirement home</div>' +
            '<div style="display:table-cell;vertical-align:middle;padding:4px 12px;">|</div>' +
            '<div style="display:table-cell;vertical-align:middle;font-size:65%;" id="grandmaReqs"></div>' +
            '</a></div>';

        for (var i in this.grandmaTypes) {
            var me = this.grandmaTypes[i];
            AddEvent(me.getMainElement(), 'click', function (t) {
                return function () {
                    PlaySound('snd/tick.mp3');
                    if (Game.keys[16]) t.remove();
                    else t.alloc();
                }
            }(me))
        }
        this.update = function () {
            // for (var i=2; i<20; i++) {
            //     var me=Game.ObjectsById[i].grandma;
            //     if (Game.Has(me.name)) this.grandmaTypes["G"+i].unlocked = true; 
            // }
            for (var i in this.grandmaTypes) {
                var me = this.grandmaTypes[i];
                if (me.unlocked) {
                    me.getMainElement().classList.add("ready");
                    me.getMainElement().style.display = "inline-block";
                } else {
                    me.getMainElement().classList.remove("ready");
                    me.getMainElement().style.display = "none";
                }
                if (me.reqFunc(me)) me.unlocked = true;
                else { me.unlocked = false; me.allocated = 0; }
                if (me.upkeep()) me.update();
            }


            if (Math.random()<=0.0003) {
                this.anger+=0.0005*Math.sqrt(this.allocT)*(Game.Has('Elder Pledge')?0.3:1);
                this.anger=Math.max(this.anger, this.angerCap());
            }
        }

        this.cpsSuckedFromAnger = function () {
            return Math.max((this.anger-0.2)*0.7);
        }

        this.angerCap = function () {
            if (Game.Has('Bingo center/Research facility') || Game.Has('Elder Covenant')) return 0.2;
            if (Game.Has('One mind')) return 0.34;
            if (Game.Has('Communal brainsweep')) return 0.67;
            if (Game.Has('Elder Pact')) return 1.0;
            return 0;
        }

        this.angerToWrath = function () {
            if (this.anger>=0.9) return 3;
            else return Math.floor(3*this.anger);
        }

        Game.UpdateGrandmapocalypse = en.injectCode(Game.UpdateGrandmapocalypse,
            "Math.random()<0.001 && Game.elderWrath<Game.Has('One mind')+Game.Has('Communal brainsweep')+Game.Has('Elder Pact')",
            "Math.random()<0.02 && Game.elderWrath<mod.bModify.grandma.angerToWrath()",
            "replace"
        )

        Game.UpdateGrandmapocalypse = en.injectCode(Game.UpdateGrandmapocalypse,
            "Game.Has('One mind') && Game.elderWrath==0",
            "false",
            "replace"
        )

        this.draw = function () {
            for (var i in this.grandmaTypes) {
                var me = this.grandmaTypes[i];
                me.getInfoElement().innerHTML = me.allocated + "/" + me.maxFunc();
            }
            l("grandmaInfo1").innerHTML = this.maxFree();
            l("grandmaInfo2").innerHTML = this.allocT;
            l('storage').innerHTML = this.storage + ' ' + (this.storage == 1 ? 'retirement home' : 'retirement homes') + '.';
            l('grandmaReqs').innerHTML = '<span' + (this.me.amount >= this.grandmaReq() ? '' : ' style="color:#777;"') + '>' + this.grandmaReq() + ' grandmas</span>' +
                '<br/><span' + (Game.cookies >= this.cookiesReq() ? '' : ' style="color:#777;"') + '>' + Beautify(this.cookiesReq()) + ' cookies</span>' +
                '<br/><span' + (Research.research >= this.researchReq() ? '' : ' style="color:#777;"') + '>' + this.researchReq() + ' research</span>';

            if (Game.Has('Bingo center/Research facility')) {
                l('grandmaAnger').innerHTML = (Game.Has('Elder Covenant')?'Satiated.':'Grandma anger: '+Math.round(this.anger*100)+'%'+
                    (this.anger>0.2??', resulting in a CpS decrease of '+Math.round(this.cpsSuckedFromAnger()*100)+'%'));
            }
        }

        this.grandmaReq = function () { return 25 * this.storage + 25; }
        this.researchReq = function () { return Math.ceil(1.6 * this.storage + 20); }
        this.cookiesReq = function () { return Math.max(Game.cookiesPsRawHighest * 60, 1e6) * Math.pow(1.2, this.storage); }

        this.upgradeStorage = function () {
            if (this.me.amount < this.grandmaReq()) return;
            if (Research.research < this.researchReq()) return;
            if (Game.cookies < this.cookiesReq()) return;
            Research.research -= this.researchReq();
            Game.Spend(this.cookiesReq());
            this.storage++;
            if (l('storageBuilder')) { var rect = l('storageBuilder').getBounds(); Game.SparkleAt((rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2); }
            this.draw();
        }

        Game.GetTieredCpsMult = en.injectCode(Game.GetTieredCpsMult,
            "mult*=(1+Game.Objects['Grandma'].amount*0.01*(1/(me.id-1)));",
            "mult*=(1+mod.bModify.grandma.grandmaTypes['G'+me.id].buildingBuff());",
            "replace"
        )
        this.me.tooltip = en.injectCode(this.me.tooltip,
            "var mult=me.amount*0.01*(1/(other.id-1));",
            "var mult=mod.bModify.grandma.grandmaTypes['G'+other.id].buildingBuff();",
            "replace"
        )
        en.saveCallback(function () {
            for (var i in grandmaM.grandmaTypes) grandmaM.grandmaTypes[i].save();
        })
        en.loadCallback(function () {
            for (var i in grandmaM.grandmaTypes) grandmaM.grandmaTypes[i].load();
        })

        this.me.cps = en.injectChain(this.me.cps, "mult*=Game.magicCpS(me.name);",
            [
                'if (mod.Research.HasTiered(1, 1)) mult*=1.15;',
                'if (mod.Research.HasTiered(1, 2)) mult*=1.15;',
                'if (mod.Research.HasTiered(1, 3)) mult*=1.15;'
            ]
        )

        Game.registerHook('reset', function (wipe) {
            grandmaM.allocT = 0;
            for (var i in grandmaM.grandmaTypes) {
                grandmaM.grandmaTypes[i].reset();
            }
            if (wipe) {
                grandmaM.storage = 0;
            }
        })
    }

    BModify.Idleverses = function () {
        this.me = Game.Objects['Idleverse'];

        this._ifactor = function (num) {
            if (num == 0) return 1;
            return 2 - Math.max((1 / Math.pow(2, num * 0.5)), 0.001);
        }

        this.resourceMult = function () {
            var fact = 1.003;
            if (Game.Has("Unshackled idleverses")) fact = 1.004;
            if (!Research.Has("Galactica mindoris")) return 1;
            return Math.max(Math.pow(fact, this.me.amount) * this._ifactor(this.me.amount), 1);
        }

        l("row17").insertAdjacentHTML('afterbegin',
            '<div class="listing" id="idleverseStat" style="position:absolute;color:rgb(36, 36, 36)" class="onlyOnCanvas"></div>'
        )

        this.getStat = function () {
            if (Research.Has("Galactica mindoris")) {
                l("idleverseStat").innerHTML = "<b>" + loc("Total resource boost provided by") + " " + this.me.amount + " idleverses:</b> "
                    + "x" + Beautify(this.resourceMult(), 3);
            } else l("idleverseStat").innerHTML = "<b>You do not have the Galactica mindoris research upgrade, and are gaining no resource space from idleverses.</b>"
        }

        this.me.cps = en.injectChain(this.me.cps, "mult*=Game.magicCpS(me.name);",
            [
                'if (mod.Research.HasTiered(17, 1)) mult*=1.3;',
                'if (mod.Research.HasTiered(17, 2)) mult*=1.3;',
                'if (mod.Research.HasTiered(17, 3)) mult*=1.3;'
            ]
        )
    }

    BModify.Idleverses.prototype.getType = function () {
        return 'Idleverse_Manager';
    }
    // ores (basically abandoned)
    BModify.Mines = function () {
        var me = this;
        this.bd = Game.Objects['Mine'];
        this.rs = this.bd.rsManager;
        this.ores = [];
        this.id = 0;

        // this.Ore = function (baseRs, baseRhpS, name1, name2, sprite) {
        //     this.rsTotal = baseRs;
        //     this.rsUsed = 0;
        //     this.oreH = 0;
        //     this.rsAvailable = baseRs;
        //     this.RhpS = baseRhpS;
        //     this.id = me.id;

        //     en.newVar("RhpS" + name2, "float");
        //     en.newVar("rsTotal" + name2, "int");
        //     en.newVar("rsUsed" + name2, "int");
        //     en.newVar("oreH" + name2, "int");
        //     l('stats3').insertAdjacentHTML('beforeend', '<div id="oreVisual' + this.id + '" style="margin-top:70px;"></div>');
        //     this.wrapper = l('oreVisual' + this.id);
        //     var str = '';
        //     str += '<div id="ore' + this.id + '" class="resBar smallFramed meterContainer" style="width:1px;">'
        //     str += '<div id="oreInfo' + this.id + '" class="shadowFilter resBarRefill barRefillL" style="' + writeIcon(sprite) + '"></div>'
        //     str += '<div id="oreBarFull' + this.id + '" class="resBarFull meter filling" style="width:1px;"></div>'
        //     str += '<div id="oreBarText' + this.id + '" class="resBarText titleFont"></div>'
        //     str += '<div id="oreBarInfo' + this.id + '" class="resBarInfo"></div>'
        //     str += '</div>'
        //     this.wrapper.innerHTML = str;
        //     this.mbarFull = l("oreBarFull" + this.id);
        //     this.mbar = l("ore" + this.id);
        //     this.mbarText = l("oreBarText" + this.id);
        //     this.mbarInfo = l("oreBarInfo" + this.id);
        //     this.mbarInfo2 = l("oreInfo" + this.id);

        //     this.oreName = name1;
        //     this.name = name2;

        //     this.unlocked = false;
        //     this.depleted = false;

        //     this.infoTooltip = function () {
        //         return ''
        //     }

        //     this.recalculate = function () {
        //         var rhpsmult = 1;
        //         var rsmult = 1;



        //         this.RhpS = baseRhpS * rhpsmult;
        //         this.rsTotal = baseRs * rsmult;
        //         this.rsAvailable = this.rsTotal - this.rsUsed;
        //     }

        //     this.harvest = function () {
        //         this.rsAvailable = this.rsTotal - this.rsUsed;
        //         if (this.rsAvailable <= 0) {
        //             this.depleted = true;
        //         } else this.depleted = false;
        //         this.rsUsed = Math.min(this.rsUsed, this.rsTotal);
        //         this.rsAvailable = Math.max(this.rsAvailable, 0);
        //         if (!this.unlocked) return;
        //         if (this.depleted) return;
        //         this.rsUsed += (this.RhpS / Game.fps);
        //         this.oreH += (this.RhpS / Game.fps);
        //     }

        //     this.clear = function () {
        //         this.rsTotal = baseRs;
        //         this.rsUsed = 0;
        //         this.oreH = 0;
        //         this.rsAvailable = baseRs;
        //         this.RhpS = baseRhpS;

        //         this.baseRhpS = baseRhpS;
        //         this.baseRs = baseRs;
        //         this.unlocked = false;
        //     }

        //     this.update = function () {

        //     }

        //     this.draw = function () {
        //         if (this.unlocked) this.wrapper.style.display = 'block';
        //         else this.wrapper.style.display = 'none';
        //         if (Game.drawT % 5 == 0) {
        //             this.mbarFull.style.width = Math.max(Math.round((this.rsAvailable / this.rsTotal) * 100), 0) + '%';
        //             this.mbar.style.width = '350px';
        //             this.mbarText.innerHTML = Beautify(Math.max((this.rsAvailable / this.rsTotal) * 100, 0), 1) + '% left';
        //             this.mbarInfo.innerHTML = 'ligma';
        //         }
        //         this.mbarFull.style.backgroundPosition = (-Game.T * 0.5) + 'px';
        //     }

        //     me.ores.push(this);
        //     me.id++;
        // }

        // this.Ore.prototype.getType = function () {
        //     return 'Mine_Ore';
        // }

        // new this.Ore(77000, 1, "Gold ore", "Gold", [0, 0]);

        // en.saveCallback(function () {
        //     BModify.mine.ores.forEach(function (me) {
        //         en.setVar("RhpS" + me.name, me.RhpS);
        //         en.setVar("oreH" + me.name, me.oreH);
        //         en.setVar("rsTotal" + me.name, me.rsTotal);
        //         en.setVar("rsUsed" + me.name, me.rsUsed);
        //     })
        // })
        // en.loadCallback(function () {
        //     BModify.mine.ores.forEach(function (me) {
        //         me.RhpS = en.getVar("RhpS" + me.name, me.RhpS);
        //         me.oreH = en.getVar("oreH" + me.name, me.oreH);
        //         me.rsTotal = en.getVar("rsTotal" + me.name, me.rsTotal);
        //         me.rsUsed = en.getVar("rsUsed" + me.name, me.rsUsed);
        //     })
        // })
    }

    BModify.Mines.prototype.getType = function () {
        return 'Mine_Mini';
    }

    BModify.Recalculate = function () {
        this.rsManagers.forEach(mn => mn.recalculate())
        //this.mine.ores.forEach(mn => mn.recalculate())
    }
    BModify.Harvest = function () {
        this.rsManagers.forEach(mn => mn.harvest())
        //this.mine.ores.forEach(mn => mn.harvest())
    }
    BModify.Logic = function () {
        BModify.Harvest()
        BModify.energyUpdate()
        l("energyTip").textContent = en.nelBeautify(Math.ceil(BModify.energy))+'/'+en.nelBeautify(BModify.maxEnergy);
        l("speedTip").textContent = "x"+Beautify(BModify.speed, 2);
        l("batteryTip").textContent = Beautify(BModify.batteryPercent*100, 1)+"%";
        BModify.rsManagers.forEach(mn => mn.draw())
        //BModify.mine.ores.forEach(mn => mn.draw())
        BModify.grandma.update()
        if (Game.T % UpdateTicks == 0) {
            BModify.grandma.draw()
        }
        if (Game.T % Game.fps == 0) {
            BModify.energyCalc()
        }
        if (BModify.bankRefill > 0) BModify.bankRefill--
    }

    en.saveCallback(function () {
        en.setVar("bankRefill", BModify.bankRefill);
        en.setVar("rsData", BModify.writeRS());
    })

    en.loadCallback(function () {
        BModify.bankRefill = en.getVar("bankRefill", BModify.bankRefill);
        BModify.loadRS(en.getVar("rsData"), BModify.writeRS());
    })

    for (var i in Game.Objects) {
        var me = Game.Objects[i];
        en.addCpsHook(i, () => {
            return BModify.efficiency * (1 + (Game.Has(me.energyTiered) ? (i == 'Cursor' ? 2 : 3 - 0.1 * me.id) : 1) * (BModify.speed - 1))
        });
    }

    Game.registerHook('cps', function (cps) {
        BModify.Recalculate();
        BModify.idleverse.getStat();
        return cps;
    })
    Game.registerHook('logic', this.Logic);
    Game.registerHook('check', function () {
        BModify.rsManagers.forEach(mn => mn.update())
        //BModify.mine.ores.forEach(mn => mn.update())

        if (BModify.totalDp >= 50000) Game.Win("Harvester")
        if (BModify.totalDp >= 100000) Game.Win("Industrializer")
        if (BModify.totalDp >= 200000) Game.Win("Climate change")
    })
    Game.registerHook('reset', function () {
        BModify.rsManagers.forEach(mn => mn.clear())
        //BModify.mine.ores.forEach(mn => mn.clear())
        BModify.bankRefill = 0
        BModify.totalDp = 0
    })


    // vals
    new BModify.RS_Manager(2, 20000, ["Arable land", "acre", "acres"]);
    new BModify.RS_Manager(3, 75000, ["Cookie ore", "ton", "tons"]);
    new BModify.RS_Manager(4, 70000, ["Chocolate fuel", "liter", "liters"]);
    new BModify.RS_Manager(5, 66000, ["Interest", "dollar", "dollars"]);
    new BModify.RS_Manager(6, 62000, ["Artifact", "gram", "grams"]);
    new BModify.RS_Manager(7, 57000, ["Mana", "magic", "magic"]);
    new BModify.RS_Manager(8, 51000, ["Planet matter", "earth mass", "earth masses"]);
    new BModify.RS_Manager(9, 49000, ["Gold", "gram", "grams"]);
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

    //this.explorer = new BModify.Explorer();

    en.trackVars(BModify.grandma, [['allocT'], ['storage'], ['anger']]);
}



export { BModify }
