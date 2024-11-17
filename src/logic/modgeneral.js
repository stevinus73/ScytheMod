var General = {}

General._Initialize = function(en) {
    this.en = en;

    /**
     * Nerfing Thousand Fingers
     */

    function fingersNerf(F) {
        return en.injectMult(F, 
            [["if (Game.Has('Unshackled cursors')) add*=	25;", "if (Game.Has('Unshackled cursors')) add*=	5;"],
            ["if (Game.Has('Trillion fingers')) add*=		20;", "if (Game.Has('Trillion fingers')) add*=		10;"],
            ["if (Game.Has('Quadrillion fingers')) add*=	20;", "if (Game.Has('Quadrillion fingers')) add*=	10;"],
            ["if (Game.Has('Quintillion fingers')) add*=	20;", "if (Game.Has('Quintillion fingers')) add*=	10;"],
             ["if (Game.Has('Sextillion fingers')) add*=	20;", "if (Game.Has('Sextillion fingers')) add*=	10;"],
             ["if (Game.Has('Septillion fingers')) add*=	20;", "if (Game.Has('Septillion fingers')) add*=	10;"]], "replace");
    }
    Game.mouseCps = fingersNerf(Game.mouseCps);
    Game.Objects['Cursor'].cps = fingersNerf(Game.Objects['Cursor'].cps);
    Game.Upgrades['Unshackled cursors'].ddesc = Game.Upgrades['Unshackled cursors'].ddesc.replace("25", "5");
    Game.Upgrades['Trillion fingers'].ddesc = Game.Upgrades['Trillion fingers'].ddesc.replace("20", "10");
    Game.Upgrades['Quadrillion fingers'].ddesc = Game.Upgrades['Quadrillion fingers'].ddesc.replace("20", "10");
    Game.Upgrades['Quintillion fingers'].ddesc = Game.Upgrades['Quintillion fingers'].ddesc.replace("20", "10");
    Game.Upgrades['Sextillion fingers'].ddesc = Game.Upgrades['Sextillion fingers'].ddesc.replace("20", "10");
    Game.Upgrades['Septillion fingers'].ddesc = Game.Upgrades['Septillion fingers'].ddesc.replace("20", "10");

    /**
     * Temple name changes + effect deletion (uses eval but this shouldn't really matter due to Game.loadMinigames rarely being called)
     */

    General.swapTime = function(swapsLeft) {
        var mult = 1;
        if (mod.research.has("Polytheism")) mult*=0.75;
        if (swapsLeft == 0) return mult*60*60*16;
        if (swapsLeft == 1) return mult*60*60*4;
        if (swapsLeft == 2) return mult*60*60;
        return 0;
    }

    General.TempleRename = function() {
        if (Game.Objects.Temple.minigame) { 
            var m = Game.Objects.Temple.minigame;
            m.gods['industry'].desc1 = '<span class="green">Increases resource use rate by 30%.</span>';
            m.gods['industry'].desc2 = '<span class="green">Increases resource use rate by 20%.</span>';
            m.gods['industry'].desc3 = '<span class="green">Increases resource use rate by 10%.</span>';
            m.gods['creation'].desc1 = '<span class="green">Increases yield by 8%.</span> <span class="red">Decreases resource use rate by 25%.</span>';
            m.gods['creation'].desc2 = '<span class="green">Increases yield by 6%.</span> <span class="red">Decreases resource use rate by 20%.</span>';
            m.gods['creation'].desc3 = '<span class="green">Increases yield by 4%.</span> <span class="red">Decreases resource use rate by 15%.</span>';
            eval("Game.Objects.Temple.minigame.godTooltip="+Game.Objects.Temple.minigame.godTooltip.toString().replace('{',"{M=Game.Objects.Temple.minigame;"));
            eval("Game.Objects.Temple.minigame.slotTooltip="+Game.Objects.Temple.minigame.slotTooltip.toString().replace('{',"{M=Game.Objects.Temple.minigame;"));
            eval("Game.Objects.Temple.minigame.draw="+Game.Objects.Temple.minigame.draw.toString().replace(
                'else if (M.swaps==1) t=1000*60*60*4;', 
                'else if (M.swaps==1) t=1000*60*60*4;\n\tif (mod.research.has("Polytheism")) t*=0.75;')
            );
            eval("Game.Objects.Temple.minigame.logic="+Game.Objects.Temple.minigame.draw.toString().replace(
                'else if (M.swaps==1) t=1000*60*60*4;', 
                'else if (M.swaps==1) t=1000*60*60*4;\n\tif (mod.research.has("Polytheism")) t*=0.75;')
            );
        }
    }
    this.TempleRename();
    Game.scriptLoaded = en.injectCode(Game.scriptLoaded, "who.minigame.launch();", "\n\tif(who.id==6){mod.general.TempleRename();}", "after");
    
    // delete the old effect
    Game.CalculateGains = en.injectCode(Game.CalculateGains, "var godLvl=Game.hasGod('industry');", "var godLvl=0;", "replace");
    Game.shimmerTypes.golden.getTimeMod = en.injectCode(Game.shimmerTypes.golden.getTimeMod, "var godLvl=Game.hasGod('industry');", "var godLvl=0;", "replace");
    Game.GetHeavenlyMultiplier = en.injectCode(Game.GetHeavenlyMultiplier, "var godLvl=Game.hasGod('creation');", "var godLvl=0;", "replace");
    Game.modifyBuildingPrice = en.injectCode(Game.modifyBuildingPrice, "var godLvl=Game.hasGod('creation');", "var godLvl=0;", "replace");
}
export { General }