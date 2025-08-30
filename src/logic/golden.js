var G = {}
G._Initialize = function(en, Research) {
    this.me = Game.shimmerTypes.golden;
    en.ue.setBatch('goldUp');
    en.ae.setBatch('goldAc');
    this.maxEffs = 1;

    // for stats
    this.fortunesEarned = 0;

    en.trackVars(G,[['maxEffs','fortunesEarned', 'rust']]);

    // tweaking around some stuffs lel
    G.me.popFunc = en.injectCode(G.me.popFunc, 
        "buff=Game.gainBuff('click frenzy',Math.ceil(13*effectDurMod),777);",
        "buff=Game.gainBuff('click frenzy',Math.ceil(13*effectDurMod),333*(1+Game.auraMult('Dragon Cursor')*(567/333)));",
        "replace"
    )
    G.me.popFunc = en.injectCode(G.me.popFunc, 
        "buff=Game.gainBuff('dragonflight',Math.ceil(10*effectDurMod),1111);",
        "buff=Game.gainBuff('dragonflight',Math.ceil(10*effectDurMod),555*(1+Game.auraMult('Dragon Cursor')*(789/555)));",
        "replace"
    )
    G.me.popFunc = en.injectCode(G.me.popFunc, 
        "buff=Game.gainBuff('dragon harvest',Math.ceil(60*effectDurMod),15);",
        "buff=Game.gainBuff('dragon harvest',Math.ceil(60*effectDurMod),25);",
        "replace"
    )
    Game.decFtMult=function(){return (Game.Has("Decisive fate")?1.5:1);}

    // increase click frenzy and cookie chain/storm chance on first ascend + decisive fate
    en.ue.appendToDesc(Game.Upgrades['Decisive fate'], '<br>Rarer golden cookie outcomes appear <b>50%</b> more often.');
    G.me.popFunc = en.injectCode(G.me.popFunc, "(Math.random()<0.1",
        "(Math.random()<(Game.ascensionMode==0&&Game.Has('Legacy')?0.1:0.75)*Game.decFtMult()", "replace");
    G.me.popFunc = en.injectCode(G.me.popFunc, "(Math.random()<0.03",
        "(Math.random()<(Game.ascensionMode==0&&Game.Has('Legacy')?0.03:0.45)*Game.decFtMult()", "replace");
    G.me.popFunc = en.injectCode(G.me.popFunc, "Math.random()<0.1)","Math.random()<0.1*Game.decFtMult())", "replace");
    G.me.popFunc = en.injectCode(G.me.popFunc, "Math.random()<0.25)","Math.random()<0.25*Game.decFtMult())", "replace");
    G.me.popFunc = en.injectCode(G.me.popFunc, "Math.random()<0.15)","Math.random()<0.15*Game.decFtMult())", "replace");
    G.me.popFunc = en.injectCode(G.me.popFunc, "Math.random()<0.3)","Math.random()<0.3*Game.decFtMult())", "replace");
    // sweet appears 10x more often
    G.me.popFunc = en.injectCode(G.me.popFunc, "Math.random()<0.0005)","Math.random()<0.005*Game.decFtMult())", "replace");


    // i could do all this with for loops but it just seems like a waste of time and unnecessary abstraction
    const pluralizedEffs = {
        'frenzy': "Frenzy",
        'dragon harvest': "Dragon Harvest",
        'click frenzy': "Click frenzy",
        'dragonflight': "Dragonflight",
        'blood frenzy': "Elder frenzy",
        'clot': "Clot",
        'cursed finger': "Cursed finger",
        'building special': "",
        'building debuff': ""
    }

    Game.isGoldenCookieEffect = function(choice) {
        return (choice == 'dragonflight' || choice == 'dragon harvest'
            || choice == 'blood frenzy' || choice == 'click frenzy'
            || choice == 'frenzy' || choice == 'building special'
            || choice == 'building debuff' || choice == 'clot'
            || choice == 'cursed finger' || choice == 'everything must go'
            || choice == 'cookie storm'
        )
    }

    G.isEff = function(choice) {
        return Game.isGoldenCookieEffect(choice) && !Game.hasBuff(pluralizedEffs[choice])
    }
    G.currEffs = function() {
        var effs = [];
        if (Game.hasBuff('Dragonflight')) effs.push('Dragonflight');
        if (Game.hasBuff('Dragon Harvest')) effs.push('Dragon Harvest');
        if (Game.hasBuff('Click frenzy')) effs.push('Click frenzy');
        if (Game.hasBuff('Elder frenzy')) effs.push('Elder frenzy');
        if (Game.hasBuff('Frenzy')) effs.push('Frenzy');
        if (Game.hasBuff('Clot')) effs.push('Clot');
        if (Game.hasBuff('Cursed finger')) effs.push('Cursed finger');
        if (Game.hasBuff('Everything must go')) effs.push('Everything must go');
        if (Game.hasBuff('Cookie storm')) effs.push('Cookie storm');
        for (var i in Game.goldenCookieBuildingBuffs) {
            if (Game.hasBuff(Game.goldenCookieBuildingBuffs[i][0])) effs.push(Game.goldenCookieBuildingBuffs[i][0]);
            if (Game.hasBuff(Game.goldenCookieBuildingBuffs[i][1])) effs.push(Game.goldenCookieBuildingBuffs[i][1]);
        }
        return effs;
    }
    G.currEffsPower = function() {
        var power=1;
        if (Game.hasBuff('Dragon Harvest')) power*=Game.hasBuff('Dragon Harvest').multCpS;
        if (Game.hasBuff('Elder frenzy')) power*=Game.hasBuff('Elder frenzy').multCpS;
        if (Game.hasBuff('Frenzy')) power*=Game.hasBuff('Frenzy').multCpS;
        if (Game.hasBuff('Clot')) power*=Game.hasBuff('Clot').multCpS;
        if (Game.hasBuff('Cursed finger')) power=0;
        for (var i in Game.goldenCookieBuildingBuffs) {
            if (Game.hasBuff(Game.goldenCookieBuildingBuffs[i][0])) {
                power*=Game.hasBuff(Game.goldenCookieBuildingBuffs[i][0]).multCpS;
            }
            if (Game.hasBuff(Game.goldenCookieBuildingBuffs[i][1])) {
                power*=Game.hasBuff(Game.goldenCookieBuildingBuffs[i][1]).multCpS;
            }
        }
        return power;
    }

    G.me.popFunc = en.injectCode(G.me.popFunc,
        "else if (choice=='blood frenzy')",
        `else if (choice=='fortune'){var moni=mod.G.fortuneEarn(mult);`
        +`popup='Fortune!<br><small>Found '+loc("+%1!",loc("%1 cookie",LBeautify(moni)))+'</small>';}\n\t\t\t`,
        "before"
    )

    en.ae.addAchievement("Elder fortune", "Obtain the Fortune effect <b>during an elder frenzy</b>.",
        [27, 6], "Eldeer", {});

    G.fortuneEarn = function(mult) {
        if (Game.hasBuff('Elder frenzy')) Game.Win("Elder fortune");
        if (G.currEffsPower()>4000) Research.unlock("Golden gates");

        var moni=mult*Game.cookiesPs*60*15+777;
        if (Research.Has('Golden gates')) moni*=Math.pow(1.5, this.currEffs().length-1);
		Game.Earn(moni);
        this.fortunesEarned++;
        Game.Notify("Fortune!", "This golden cookie effect, which would have exceeded the golden cookie effect cap, has been converted into cookies.", [23, 6]);
        return moni;
    }
    // the big one
    G.me.popFunc = en.injectCode(G.me.popFunc,
        "this.last=choice;",
        "if(mod.G.isEff(choice) && mod.G.currEffs().length == mod.G.maxEffs){choice='fortune'};\n\t\t\t",
        "before"
    )

    // starlight
    new Game.buffType('starlight',function(time,pow)
		{
			return {
				name:'Starlight',
				desc:"Golden cookie effect cap +"+pow+" for "+Game.sayTime(time*Game.fps,-1)+"!",
				icon:[9,9],
				time:time*Game.fps,
				power:pow,
                add:true,
                aura:1
			};
		});

    G.gainStarlight = function(time) {
        var old=Game.hasBuff('Starlight');
        var pow=(old?old.power+1:1);
        var buff=Game.gainBuff('starlight',time,pow);
        buff.arg1=pow;
        buff.power=pow;
        return buff;
    }

    // click frenzy/dragonflight mutual exclusitivity (well, technically not completely mutually exclusive but eh, whatever)
    // anything that was supposed to give click frenzy now gives fortune (fun!)
    // also nerfed dragonflight chances
    G.me.popFunc = en.injectCode(G.me.popFunc,
        "if (me.force!='') {this.chain=0;choice=me.force;me.force='';}",
        "if (me.force!='') {this.chain=0;choice=me.force;if (choice=='click frenzy' && Game.hasBuff('Dragonflight')){choice='fortune';};me.force='';}",
        "replace"
    )
    // this just makes it harder to get cf+df
    G.me.popFunc = en.injectCode(G.me.popFunc,
        "if (Math.random()<0.8) Game.killBuff('Click frenzy');",
        "if (Math.random()<0.9) Game.killBuff('Click frenzy');",
        "replace"
    )

    G.me.popFunc = en.injectCode(G.me.popFunc, "if (Game.goldenClicks>=7) Game.Unlock('Lucky day');", 
        "if (Game.goldenClicks>=1) Game.Unlock('Lucky day');", "replace");
    G.me.popFunc = en.injectCode(G.me.popFunc, "if (Game.goldenClicks>=27) Game.Unlock('Serendipity');", 
        "if (Game.goldenClicks>=3) Game.Unlock('Serendipity');", "replace");
    G.me.popFunc = en.injectCode(G.me.popFunc, "if (Game.goldenClicks>=77) Game.Unlock('Get lucky');", 
        "if (Game.goldenClicks>=7) Game.Unlock('Get lucky');", "replace");

    en.ae.addAchievement("The click to end all clicks", 
        "Have both <b>Click frenzy</b> and <b>Dragonflight</b> active at the same time.<q>Oh my Orteil, what have you done?</q>",
        [12, 0], "True Neverclick", {pool: 'shadow'});

    // dragon cursor
    Game.dragonAuras[2].desc="Click frenzy and Dragonflight are stronger.<br>"+loc("Clicking gains <b>+%1% of your CpS</b>.",5);
    Game.dragonLevels[5].action='Train Dragon Cursor<br><small>Aura: boost to Click frenzy and Dragonflight</small>';
    Game.mouseCps = en.injectCode(Game.mouseCps,
        "mult*=1+Game.auraMult('Dragon Cursor')*0.05;",
        "add+=Game.cookiesPs*Game.auraMult('Dragon Cursor')*0.05;",
        "replace"
    )

    en.ue.addUpgrade("Shimmering aura", "Increases the golden cookie effect cap by <b>1</b>.<div class=\"line\"></div>Unlocks a new Golden switch mode."
        +'<q>Ethereal!</q>',
        7777777, [9,9], 0, {pool: 'prestige', posX: -345, posY: 270, parents: 
            [Game.Upgrades['Heavenly luck'], Game.Upgrades['Lasting fortune'], Game.Upgrades['Decisive fate']]}
    );

    en.ue.addUpgrade("Golden glow", "Increases the golden cookie effect cap by <b>1</b>.<div class=\"line\"></div>Unlocks a new Golden switch mode."
        +'<q>Maybe your alchemy labs can do something with this.</q>',
        7777777777777777, [4,0,Icons], 0, {pool: 'prestige', posX: -293, posY: 770, 
            parents: [Game.Upgrades['Distilled essence of redoubled luck']], showIf:function(){return Game.Has("Shimmering aura");}}
    );

    // golden switch
    Game.gsType=0;
    var gsChoicesFunction=function(){
		var choices=[];
		choices[0]={name:"Golden switch [full]",icon:[21,10]};
        choices[1]=Game.Has('Shimmering aura')?{name:"Golden switch [limited 1]",icon:[1,2,Icons]}:0;
        choices[2]=Game.Has('Golden glow')?{name:"Golden switch [limited 2]",icon:[1,3,Icons]}:0;
		choices[Game.gsType].selected=1;
		return choices;
    }

    var gsPick=function(id){Game.gsType=id;}

    en.ue.addUpgrade("Golden switch mode selector", "Allows you to <b>change Golden switch modes</b>."+
        "<q>How much would a Golden switch mode switcher switch Golden switch modes if it could switch Golden switch modes?</q>", 
        0, [21, 10], 40000, {pool:'toggle',choicesFunction:gsChoicesFunction,choicesPick:gsPick});
    
    eval("Game.shimmerTypes.golden.spawnConditions="+
        G.me.spawnConditions.toString().replace("Game.Has('Golden switch [off]')","(Game.Has('Golden switch [off]')&&(Game.gsType==0))"));
    
    //eval("Game.CalculateGains="+
    //    Game.CalculateGains.toString().replace("Game.Has('Golden switch [off]')","(Game.Has('Golden switch [off]')&&(Game.gsType==0))"));    

    var funcOn=function(){
        if (Game.gsType==0) {
		    if (Game.Has('Residual luck')) {
			    var bonus=0;
			    var upgrades=Game.goldenCookieUpgrades;
			    for (var i in upgrades) {if (Game.Has(upgrades[i])) bonus++;}
			    return '<div style="text-align:center;">'+Game.listTinyOwnedUpgrades(Game.goldenCookieUpgrades)+'<br><br>The effective boost is <b>+'+
                    Beautify(Math.round(50+bonus*10))+'%</b><br>thanks to residual luck<br>and your <b>'+bonus+'</b> golden cookie upgrade'+(bonus==1?'':'s')+'.</div><div class="line"></div>'+this.ddesc;
		    }
		    return this.desc;
        } else if (Game.gsType==1) {
            return 'The switch is currently giving an extra <b>+35% golden cookie frequency</b> and <b>+60% golden cookie gains</b>; '+
                'it also decreases the maximum golden cookie effect cap to 1.<br>Turning it off will revert those effects.<br>Cost is equal to 1 hour of production.';
        } else if (Game.gsType==2) {
            return 'The switch is currently giving an extra <b>+20% golden cookie frequency</b> and <b>+25% golden cookie gains</b>; '+
                'it also decreases the maximum golden cookie effect cap to 2.<br>Turning it off will revert those effects.<br>Cost is equal to 1 hour of production.';
        }
	};
    var funcOff=function(){
        if (Game.gsType==0) {
		    if (Game.Has('Residual luck')) {
			    var bonus=0;
			    var upgrades=Game.goldenCookieUpgrades;
			    for (var i in upgrades) {if (Game.Has(upgrades[i])) bonus++;}
			    return '<div style="text-align:center;">'+Game.listTinyOwnedUpgrades(Game.goldenCookieUpgrades)+'<br><br>The effective boost is <b>+'+
                    Beautify(Math.round(50+bonus*10))+'%</b><br>thanks to residual luck<br>and your <b>'+bonus+'</b> golden cookie upgrade'+(bonus==1?'':'s')+'.</div><div class="line"></div>'+this.ddesc;
		    }
		    return this.desc;
        } else if (Game.gsType==1) {
            return 'Turning this on will give <b>+35% golden cookie frequency</b> and <b>+60% golden cookie gains</b>, but decrease the maximum golden cookie effect cap to 1.<br>Cost is equal to 1 hour of production.';
        } else if (Game.gsType==2) {
            return 'Turning this on will give <b>+20% golden cookie frequency</b> and <b>+25% golden cookie gains</b>, but decrease the maximum golden cookie effect cap to 2.<br>Cost is equal to 1 hour of production.';
        }
	};
    en.addGcHook('gains',function(m){return m*(Game.Has('Golden switch [off]')&&(Game.gsType==1)?1.6:1)})
    en.addGcHook('frequency',function(m){return m/(Game.Has('Golden switch [off]')&&(Game.gsType==1)?(1/1.35):1)})
    en.addGcHook('gains',function(m){return m*(Game.Has('Golden switch [off]')&&(Game.gsType==2)?1.25:1)})
    en.addGcHook('frequency',function(m){return m/(Game.Has('Golden switch [off]')&&(Game.gsType==2)?(1/1.20):1)})
	Game.Upgrades['Golden switch [off]'].descFunc=funcOff;
    Game.Upgrades['Golden switch [on]'].descFunc=funcOn;

    //Game.Unlock('Golden switch mode switcher');

    // fortune moved
    Game.Upgrades['Fortune cookies'].posX=-640;Game.Upgrades['Fortune cookies'].posY=543
    Game.Upgrades['Fortune cookies'].parents=[Game.Upgrades['Decisive fate']]
    Game.Upgrades['Fortune cookies'].basePrice=77777777
    Game.Tiers['fortune'].price=77777777777777777777

    // updates
    G.update = function() {
        if (Game.hasBuff('Dragonflight') && Game.hasBuff('Click frenzy')) Game.Win("The click to end all clicks");

        var maxEffs=1;
        if (Game.Has('Shimmering aura')) {if (Game.Has('Golden switch')){Game.Unlock('Golden switch mode selector');}maxEffs++;}
        if (Game.Has('Golden glow')) maxEffs++;
        if (Game.Has('Golden switch [off]')&&(Game.gsType==1)) maxEffs=1;
        if (Game.Has('Golden switch [off]')&&(Game.gsType==2)) maxEffs=2;
        if (Game.hasBuff('Starlight')) maxEffs+=Game.hasBuff('Starlight').pow;
        this.maxEffs=maxEffs;

        var effs=G.currEffs();
        if (effs.length>this.maxEffs) Game.killBuff(choose(effs));
    }
    
    Game.registerHook('logic', function() {
        if (Game.T%(Game.fps)==0) G.update();
    });
}

export {G}