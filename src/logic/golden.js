var G = {}
G._Initialize = function(en, Research) {
    this.me = Game.shimmerTypes.golden;
    this.maxEffs = 3;

    // tweaking around some stuffs lel
    G.me.popFunc = en.injectCode(G.me.popFunc, 
        "buff=Game.gainBuff('click frenzy',Math.ceil(13*effectDurMod),777);",
        "buff=Game.gainBuff('click frenzy',Math.ceil(13*effectDurMod),77*(1+Game.auraMult('Dragon Cursor')*(133/77)));",
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
        var time=Game.cookiesPs*60*10;
        var moni=mult*time+777;
		Game.Earn(moni);
        return moni;
    }
    // the big one
    G.me.popFunc = en.injectCode(G.me.popFunc,
        "this.last=choice;",
        "if(mod.G.isEff(choice) && mod.G.currEffs().length == mod.G.maxEffs){choice='fortune'};\n\t\t\t",
        "before"
    )
}

export {G}