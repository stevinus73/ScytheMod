var G = {}
G._Initialize = function(en, Research) {
    this.me = Game.shimmerTypes.golden;
    this.maxEffs = 1;

    // for stats
    this.fortunesEarned = 0;

    // tweaking around some stuffs lel
    G.me.popFunc = en.injectCode(G.me.popFunc, 
        "buff=Game.gainBuff('click frenzy',Math.ceil(13*effectDurMod),777);",
        "buff=Game.gainBuff('click frenzy',Math.ceil(13*effectDurMod),233*(1+Game.auraMult('Dragon Cursor')*(377/233)));",
        "replace"
    )
    G.me.popFunc = en.injectCode(G.me.popFunc, 
        "buff=Game.gainBuff('dragonflight',Math.ceil(10*effectDurMod),1111);",
        "buff=Game.gainBuff('dragonflight',Math.ceil(10*effectDurMod),555*(1+Game.auraMult('Dragon Cursor')*(1111/555)));",
        "replace"
    )
    G.me.popFunc = en.injectCode(G.me.popFunc, 
        "buff=Game.gainBuff('dragon harvest',Math.ceil(60*effectDurMod),15);",
        "buff=Game.gainBuff('dragon harvest',Math.ceil(60*effectDurMod),25);",
        "replace"
    )

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

    G.isEff = function(choice) {
        return (choice == 'dragonflight' || choice == 'dragon harvest'
            || choice == 'blood frenzy' || choice == 'click frenzy'
            || choice == 'frenzy' || choice == 'building special'
            || choice == 'building debuff' || choice == 'clot'
            || choice == 'cursed finger'
        ) && !Game.hasBuff(pluralizedEffs[choice])
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
        for (var i in Game.goldenCookieBuildingBuffs) {
            if (Game.hasBuff(Game.goldenCookieBuildingBuffs[i][0])) effs.push(Game.goldenCookieBuildingBuffs[i][0]);
            if (Game.hasBuff(Game.goldenCookieBuildingBuffs[i][1])) effs.push(Game.goldenCookieBuildingBuffs[i][1]);
        }
        return effs;
    }

    G.me.popFunc = en.injectCode(G.me.popFunc,
        "else if (choice=='blood frenzy')",
        `else if (choice=='fortune'){var moni=mod.G.fortuneEarn(mult);`
        +`popup='Fortune!<br><small>Found '+loc("+%1!",loc("%1 cookie",LBeautify(moni)))+'</small>';}\n\t\t\t`,
        "before"
    )
    G.fortuneEarn = function(mult) {
        var moni=mult*Game.cookiesPs*60*15+777;
        moni*=Math.pow(3, this.currEffs().length-1);
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
        "if (Math.random()<0.95) Game.killBuff('Click frenzy');",
        "replace"
    )
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
        777777777777777, [4,0,Icons], 19300, {pool: 'prestige', posX: -293, posY: 770, parents: [Game.Upgrades['Distilled essence of redoubled luck']]}
    );

    // fortune moved
    Game.Upgrades['Fortune cookies'].posX=-640;Game.Upgrades['Fortune cookies'].posY=543
    Game.Upgrades['Fortune cookies'].parents=[Game.Upgrades['Decisive fate']]
    Game.Upgrades['Fortune cookies'].basePrice=77777777
    Game.Tiers['fortune'].price=77777777777777777777

    G.update = function() {
        if (Game.hasBuff('Dragonflight') && Game.hasBuff('Click frenzy')) Game.Win("The click to end all clicks");

        var maxEffs=1;
        if (Game.Has('Shimmering aura')) maxEffs++;
        if (Game.Has('Golden glow')) maxEffs++;
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