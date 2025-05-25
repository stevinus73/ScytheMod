var Research = {};

function cfl(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

Research._Initialize = function(en) {
    this.en = en;

    var str = '';
    str += '<div class="smallFancyButton framed" id="researchButton" style="margin-top: 0px; position:relative;' 
    str += 'background: url(//cdn.dashnet.org/cookieclicker/img/shadedBorders.png),url(//cdn.dashnet.org/cookieclicker/img/BGgrimoire.jpg)" '
    str += 'onclick="mod.research.switch(-1)">'
    str += '<div>View Research</div></div>'
    l("comments").insertAdjacentHTML('beforeend','<div id="researchDisplay"></div>')
    l("buildingsMaster").style.zIndex=20;
    l("buildingsMaster").insertAdjacentHTML('afterbegin', str);
    this.button = l("researchButton");


    str = '';
    str += '<div class="smallFancyButton framed" id="statsSwitchesButton" style="margin-top: 0px; position:relative;' 
    str += 'background: url(//cdn.dashnet.org/cookieclicker/img/shadedBorders.png),url(//cdn.dashnet.org/cookieclicker/img/BGmarket.jpg)" '
    str += 'onclick="mod.research.switchStats(-1)">'
    str += '<div>View Stats And Switches</div></div>'
    l("buildingsMaster").insertAdjacentHTML('afterbegin', str);
    this.statsButton = l("statsSwitchesButton");

    en.newVar('techData', 'string');


    this.researchOn = false;
    this.statsOn = false;

    l("centerArea").insertAdjacentHTML('beforeend', 
        '<style>#research{z-index: 1; background: url("img/starbg.jpg"); position: absolute; inset: 40px 0px 0px; display: none; cursor: move;}'+
        '#statsSwitches{z-index: 1; background: url("img/starbg.jpg"); position: absolute; inset: 40px 0px 0px; display: none;}'+
        '#researchDisplay{cursor: pointer; position: absolute; right: 0px; bottom: -12px; width: 32px; height: 32px; z-index: 1000; filter:drop-shadow(0px 3px 2px #000); -webkit-filter:drop-shadow(0px 3px 2px #000);}'+
        '#researchIcon{width: 48px; height: 48px; right: -8px; top: -8px; position: absolute; pointer-events: none;}'+
        '#researchAmount{font-size: 12px; color: #6cf; position: absolute; right: 36px; top: 6px; text-align: right; width: 200px;}'+
        '.research.price:before{width:48px;height:48px;left:-20px;top:-14px;'+writeIcon([1, 0, Icons])+'transform:scale(0.5);}'+
        '.noscroll{overflow-y: hidden;}'+
        '#statsSwitchesButton{cursor: pointer;}'+
        '#statsSwitches{top: 64px;}'+
        '#researchButton{cursor: pointer;}</style>'
    )
    l("centerArea").insertAdjacentHTML('beforeend', '<div id="research"></div>')
    l("centerArea").insertAdjacentHTML('beforeend', '<div id="statsSwitches"></div>')
    this.container = l("research");
    this.container.style.zIndex=10;
    this.stats = l("statsSwitches");
    this.stats.style.zIndex=10;
    var str = '<div class="section">Stats and Switches</div>'+
        '<div class="subsection">'+
		'<div class="title" style="position:relative;">Esoteric statistics'+
		'</div><div id="modStats" style="display:none;">'+
        '</div></div>';

    str += '<div class="subsection">'+
		'<div class="title" style="position:relative;">Switches'+
		'</div><div id="modGui">'+
        '</div></div>';

    this.stats.innerHTML = str;
    this.container.insertAdjacentHTML('beforeend', '<div id="researchCrates"></div>')
    this.crates = l("researchCrates");
    this.container.insertAdjacentHTML('beforeend', '<div id="researchContent" style="position: absolute;"></div>')
    this.content = l("researchContent");
    this.display = l("researchDisplay");
    this.display.insertAdjacentHTML('beforeend', '<div id="researchIcon" class="usesIcon" style="'+writeIcon([1, 0, Icons])+'"></div>')
    this.display.insertAdjacentHTML('beforeend', '<div id="researchAmount"></div>')
    this.num = l("researchAmount");
    this.numUpgrades = 0;
    this.research = 0;

    this.userX = 0;
    this.userY = 0;
    this.userXT = 0;
    this.userYT = 0;
    this.userDragX = 0;
    this.userDragY = 0;
    this.dragging = false;
    
    en.trackVars(Research, [['research']]);
    en.ae.addAchievement("Doctorate", "Research <b>20 upgrades</b>.", [1, 0, Icons], "Oft we mar what's well", {});
    en.ae.addAchievement("Researcher", "Research <b>50 upgrades</b>.", [9, 1], "Oft we mar what's well", {});

    this.trees = {};
    this.currTreeInit = "";

    Research.Tech = function(name, desc, priceR, requirements, onBuy, parents, sprite, x, y) {
        this.tree = Research.trees[Research.currTreeInit];
        this.tree.upgrades.push(this);
        this.tree.upgradesByName[name] = this;
        this.name = name;
        this.desc = desc;

        this.priceR = priceR;
        this.requirements = requirements;
        this.req = false;
        this.onBuy = onBuy;
        this.parents = Array.from(parents, (i) => this.tree.upgrades[i]);
        this.sprite = sprite;
        this.x = x; // -1 to 1
        this.y = y; // -1 to 1
        this.id = this.tree.id;
        this.bought = false;
        this.priceB = 0;

        this.loadSave = function(str) {
            var sstr = str.split(' ');
            this.req = sstr[0];
            this.bought = sstr[1];
        }

        this.writeSave = function() {
            return this.req + ' ' + this.bought;
        }

        this.canBuy = function() {
            var parentBuy = true;
            this.parents.forEach(function(parent) {
                if (!parent.bought) parentBuy = false;
            });
            return (this.req && parentBuy && (Research.research >= this.getPrice()));
        }

        this.getPrice = function() {
            var priceMult = 1;
            if (Research.has("Better application forms")) priceMult *= 0.9;
            return Math.round(this.priceR * priceMult);
        }

        this.click = function() {
            if (Game.keys[16]) this.unbuy();
            else this.buy();
        }

        this.buy = function() {
            if ((!this.canBuy()) || this.bought) return;
            this.priceB = this.getPrice();
            Research.research -= this.priceB;
            this.bought = true;
            Research.numUpgrades++;
            //this.onBuy();
            Research.draw();
            Game.recalculateGains = 1;
        }

        this.get = function() {
            this.bought = true;
            Research.numUpgrades++;
            Research.draw();
            Game.recalculateGains = 1;
        }

        this.unbuy = function() {
            if (!this.bought || (this.id==0)) return;
            this.bought = false;
            Research.earn(this.priceB);
            Research.numUpgrades--;
            Research.draw();
            Game.recalculateGains = 1;
        }

        this.createLinks = function() {
            var str = '';
            if (!this.isAvailable()) return str;
            for (var ii in this.parents) {
                if (this.parents[ii]!=-1) {
                    var ppos = this.parents[ii].getPosition();
                    var mpos = this.getPosition();
                    var origX = ppos.posX+28;
                    var origY = ppos.posY+28;
                    var targX = mpos.posX+28;
                    var targY = mpos.posY+28;
                    var rot=-(Math.atan((targY-origY)/(origX-targX))/Math.PI)*180;
                    if (targX<=origX) rot+=180;
                    var dist=Math.floor(Math.sqrt((targX-origX)*(targX-origX)+(targY-origY)*(targY-origY)));
                    str+='<div class="parentLink" id="researchLink'+this.tree.name+this.id+'-'+ii+'" style="width:'+dist+'px;-webkit-transform:rotate('+rot+'deg);-moz-transform:rotate('+rot+'deg);-ms-transform:rotate('+rot+'deg);-o-transform:rotate('+rot+'deg);transform:rotate('+rot+'deg);left:'+(origX)+'px;top:'+(origY)+'px;"></div>';
                }
            }
            return str;
        }

        this.getPosition = function() {
            var cX = Research.container.offsetWidth  * 0.5 - 28;
            var cY = Research.container.offsetHeight * 0.5 - 28;
            var sX =  this.x * 500 + cX;
            var sY = -this.y * 500 + cY;
            return {posX: sX, posY: sY};
        }

        this.isAvailable = function() {
            var available = false;
            this.parents.forEach(function(parent) {
                if (parent.bought) available = true;
            });
            if (this.parents.length == 0) available = true;
            // if (!this.req) available = false;
            if (this.bought) available = true;
            return available;
        }

        this.draw = function() {
            var available = this.isAvailable();
            var sX = this.getPosition().posX;
            var sY = this.getPosition().posY;
            var classes = 'crate upgrade heavenly';
            var clickStr = available ? 'mod.research.currTree.upgrades['+this.id+'].click()' : ''; 
            var tname = this.tree.name;
            var enabled = 0;
            if (this.bought) enabled=1;
            if (enabled) classes += ' enabled'; //trees["'+tname+'"]
            return '<div data-id="'+this.tree.name+this.id+'" '+Game.clickStr+'="'+clickStr+'"'+
            ' class="'+classes+'" '+Game.getDynamicTooltip(`function(){return mod.research.trees['`+tname+`'].upgrades[`+this.id+`].getTooltip()}`, 
                'top', true)
            +' id="researchUp'+this.tree.name+this.id+'" '+
            'style="'+writeIcon(this.sprite)+'position:absolute;left:'+sX+'px;top:'+sY+'px;'+(available?'':'display:none;')+'"></div>';
        }

        this.getTooltip = function() {
            var tags = [];
            var price='';

            tags.push(loc("[Tag]Tech",0,'Tech'),'#36a4ff');
            if (this.bought) tags.push(loc("Researched"),0);
            if (!this.req) tags.push(loc("Locked"),0);

            var tagsStr='';
            for (var i=0;i<tags.length;i+=2)
            {
                if (i%2==0) tagsStr+='<div class="tag" style="background-color:'+(tags[i+1]==0?'#fff':tags[i+1])+';">'+tags[i]+'</div>';
            }
            var cost=this.getPrice();
            price='<div style="float:right;text-align:right;"><span class="price research'+ (this.canBuy() ? '' : ' disabled') +'">'+Beautify(Math.round(cost))+'</span></div>';
            var tip = this.canBuy() ? loc("Click to research.") : "";
            if (this.bought && (this.id!=0)) {
                if (Game.keys[16]) tip=loc("You are holding Shift. Clicking this research upgrade will unbuy it and refund your research.");
                else tip=loc("Shift-click to refund.");
            }
            if (!this.req) tip=loc("This upgrade hasn't been unlocked yet.");
            return '<div style="position:absolute;left:1px;top:1px;right:1px;bottom:1px;background:linear-gradient(125deg,rgba(54,164,255,1) 0%,rgba(54,164,255,0) 20%);mix-blend-mode:screen;z-index:1;"></div><div style="z-index:10;padding:8px 4px;min-width:350px;position:relative;" id="tooltipCrate">'+
            '<div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;'+writeIcon(this.sprite)+'"></div>'+(this.req?price:'')+
            '<div class="name">'+(this.req?this.name:'???')+'</div>'+tagsStr+
            '<div class="line"></div><div class="description">'+(this.req?this.desc:"You must " +this.requirements.reqDesc+" to unlock this research upgrade.")+'</div></div>'+
            (tip!=''?('<div class="line"></div><div style="font-size:10px;font-weight:bold;color:#999;text-align:center;padding-bottom:4px;line-height:100%;" class="crateTip">'+tip+'</div>'):'');
        }

        this.unlock = function() {
            if (!this.req && this.requirements.reqDesc) Game.Notify("Unlocked new research!", "Check your research trees!", [9, 0]);
            this.req = true;
        }

        this.check = function() {
            if (this.requirements.reqFunc()) {
                this.unlock();
            }
        }

        this.tree.id += 1;
    }

    Research.Tech.prototype.getType = function () {
        return 'TechUpgrade';
    }

    Research.Tree = function(name, sprite, requirements) {
        this.name = name;
        this.sprite = sprite;
        this.requirements = requirements;
        Research.currTreeInit = name;
        this.id = 0;
        Research.trees[name] = this;
        this.upgrades = [];
        this.upgradesByName = {};
        this.curr = false;

        this.loadSave = function(str) {
            var me = this;
            str.split('&').forEach((up, index) => {
                me.upgrades[index].loadSave(up);
            })
        }

        this.writeSave = function() {
            let toCompress = [];
            this.upgrades.forEach((up) => {
                toCompress.push(up.writeSave());
            })
            return toCompress.join('&');
        }

        this.getCrate = function() {
            if (!this.requirements()) return '';
            var classes = 'crate upgrade';
            if (this.curr) classes += ' enabled';
            var clickStr = `mod.research.setCurrTree('`+this.name+`');mod.research.draw();`;
            return '<div data-id="'+this.name+"tree"+'" '+Game.clickStr+'="'+clickStr+'"'
            +' class="'+classes+'" '+Game.getDynamicTooltip(`mod.research.trees['`+this.name+`'].getTooltip`, 
                'top', true)
            +' id="researchTreeCrate'+this.name+'" '+
            'style="'+writeIcon(this.sprite)+' z-index:2; top:64px;"></div>';
        }

        this.getTooltip = function() {
            return '<div style="padding:8px;width:300px;font-size:11px;text-align:center;">This is the '+this.name+
            ' research tree.<div class="line"></div>Click on it to switch to this research tree.</div>';
        }

        this.draw = function() {
            var str = '';
            this.upgrades.forEach(function(u) {
                str += u.draw();
                str += u.createLinks();
            })
            return str;
        }

        this.has = function(name) {
            var it = this.upgradesByName[name];
            return (it?it.bought:false);
        }
    }

    Research.Tree.prototype.getType = function () {
        return 'TechTree';
    }

    Game.resize = en.injectCode(Game.resize, 'Game.scale=scale;', 'mod.research.draw();', "after");

    Research.switch = function(on) {
        if (on == -1) on = !this.researchOn;
        this.researchOn = on;
        if (this.researchOn) {
            this.container.style.display = "block";
            l("rows").style.display = "none";
            l("centerArea").style.overflowY = "hidden";
            this.button.firstChild.textContent = "Close Research";
            this.draw();
            this.switchStats(false);
        } else {
            this.container.style.display = "none";
            l("rows").style.display = "block";
            l("centerArea").style.overflowY = "auto";
            this.button.firstChild.textContent = "View Research";
            if (Game.onMenu == '') {
                for (var i in Game.Objects) {
                    var me = Game.Objects[i];
                    me.toResize = true;
                    if (me.minigame && me.minigame.onResize) me.minigame.onResize();
                }
            }
        }
    }

    Research.switchStats = function(on) {
        if (on == -1) on = !this.statsOn;
        this.statsOn = on;
        if (this.statsOn) {
            this.stats.style.display = "block";
            l("rows").style.display = "none";
            l("centerArea").style.overflowY = "hidden";
            this.statsButton.firstChild.textContent = "Close Stats And Switches";
            this.draw();
            this.switch(false);
        } else {
            this.stats.style.display = "none";
            l("rows").style.display = "block";
            l("centerArea").style.overflowY = "auto";
            this.statsButton.firstChild.textContent = "View Stats And Switches";
            if (Game.onMenu == '') {
                for (var i in Game.Objects) {
                    var me = Game.Objects[i];
                    me.toResize = true;
                    if (me.minigame && me.minigame.onResize) me.minigame.onResize();
                }
            }
        }
    }

        Research.loadSave = function(str) {
            var me = this;
            str.split('/').forEach((tree) => {
                me.trees[tree.split('>')[0]].loadSave(trees.split('>')[1]);
            })
        }

        Research.writeSave = function() {
            let toCompress = [];
            this.upgrades.forEach((tree) => {
                toCompress.push(tree.name + '>' + tree.writeSave());
            })
            return toCompress.join('/');
        }

    Research.clear = function() {
        this.switch(false);
        this.switchStats(false);
    }

    Research.draw = function() {
        if (!this.researchOn) return;
        this.content.innerHTML = this.currTree.draw();
        var crateStr = '';
        for (var i in this.trees) {
            crateStr += this.trees[i].getCrate();
        }
        this.crates.innerHTML = crateStr;

        // stats
        l("modStats").style.display=(this.has("Otherworldly sight")?'block':'none');
    }

    Research.appendStat = function(str) {
        l("modStats").insertAdjacentHTML('beforeend', str);
    }

    Research.appendGui = function(str) {
        l("modGui").insertAdjacentHTML('beforeend', str);
    }

    Research.update = function() {
        if (Game.keys[37]) this.userXT -= 8;
        if (Game.keys[38]) this.userYT -= 8;
        if (Game.keys[39]) this.userXT += 8;
        if (Game.keys[40]) this.userYT += 8;
        if (this.userXT < -1200) this.userXT = -1200;
        if (this.userYT < -1200) this.userYT = -1200;
        if (this.userXT >  1200) this.userXT =  1200;
        if (this.userYT >  1200) this.userYT =  1200;
        this.userX += 0.5 * (this.userXT - this.userX);
        this.userY += 0.5 * (this.userYT - this.userY);
        if (Math.abs(this.userXT - this.userX) < 0.005) this.userX = this.userXT;
        if (Math.abs(this.userYT - this.userY) < 0.005) this.userY = this.userYT;
        if (Game.mouseDown && !Game.promptOn && this.container.matches(":hover")) {
            if (!this.dragging) {
                this.dragX = Game.mouseX;
                this.dragY = Game.mouseY;
            }
            this.dragging = true;
            this.userXT -= (Game.mouseX - this.dragX);
            this.userYT -= (Game.mouseY - this.dragY);
            this.dragX = Game.mouseX;
            this.dragY = Game.mouseY;
        } else this.dragging = false;
        if (Game.Click || Game.promptOn) this.dragging = false;

        var ts = 'translate('+Math.floor(-this.userX)+'px,'+Math.floor(-this.userY)+'px)';
        this.content.style.transform = ts;
        if (Game.onMenu != '') {this.switch(false);this.switchStats(false);}

        this.num.textContent = this.research;
    }

    Research.setCurrTree = function(treeName) {
        if (this.currTree) this.currTree.curr = false;
        this.currTree = this.trees[treeName];
        this.trees[treeName].curr = true;
        this.userX = 0;
        this.userY = 0;
        this.userXT = 0;
        this.userYT = 0;
        this.dragX = 0;
        this.dragY = 0;
    }

    Research.has = function(name) {
        if (Game.ascensionMode != 0) return false;
        for (var i in this.trees) {
            if (this.trees[i].has(name)) return true;
        }
        return false;
    }

    Research.unlock = function(name) {
        for (var i in this.trees) {
            if (this.trees[i].has(name)) {
                this.trees[i].upgradesByName[name].unlock();
            }
        }
    }

    Research.buyAll = function() {
        for (var i in this.trees) {
            this.trees[i].upgrades.forEach(function(up) {
                up.get();
            })
        }
    }

    Research.earn = function(num) {
        this.research+=num;
        var rect=l("researchIcon").getBounds();
        Game.Popup('<small>+'+Beautify(num)+' research</small>',(rect.left+rect.right)/2,(rect.top+rect.bottom)/2-48);
    }

    Research.earnResearch = function(num) {
        var mult = 1;
        if (this.has("Supercomputers")) mult *= 1.1;
        if (this.has("Thinktank")) mult *= 1.1;
        this.earn(Math.round(num * mult));
    }
    Game.Win = en.injectCode(Game.Win, 'it.won=1;', 'mod.research.earnResearch(10);', "after");
    

    var f={reqFunc:function(){return true;},reqDesc:''};
    function req(amnt, reqNum, amntN) {
        return {reqFunc:function(){return amnt() >= reqNum;},reqDesc:"get "+reqNum+" "+amntN};
    }
    function breq(building, reqNum){
        return req(() => Game.Objects[building].amount, reqNum, Game.Objects[building].plural);
    }

    new Research.Tree("General", [10, 0], function(){return true;});

    new Research.Tech("Research lab", "Unlocks the <b>Research tree</b>, where you can buy upgrades using research (the number in the top right corner). <div class=\"line\"></div>"+
        " You gain research in a variety of ways, such as earning achievements. <div class=\"line\"></div>"+
        " Research upgrades are kept across ascensions. <q>It's quite small, but so is your current business.</q>", 1, f, f, [], [1, 0, Icons], 0, 0); //0
    new Research.Tech("Plain cookie", "Cookie production multiplier <b>+5%</b>. <q>We all gotta start somewhere. </q>", 20, f, f, [0], [2, 3], -0.2, 0.5); //1
    new Research.Tech("Interns", "Unlocks a new grandma type that <b>gains research passively</b>. <q>Grandmas. Can they be trusted? Can they be relied on? All I know is that I can use them for unpaid labor.</q>", 10, f, f, [0], [9, 0], 0.3, 0); //2
    new Research.Tech("Better application forms", "Research costs <b>10%</b> less.", 100, f, f, [2], [9, 1], 0.6, 0); //3
    new Research.Tech("Kitten scientists", "You gain <b>more CpS</b> the more milk you have.<q>science is a natural for meow</q>", 999, req(() => Game.AchievementsOwned, 500, "achievements"), f, [1], [18, 21], -0.6, 0.4); //4
    Game.CalculateGains = en.injectCode(Game.CalculateGains, `if (Game.Has('Fortune #103')) catMult*=(1+Game.milkProgress*0.05*milkMult);`,
        `\n\tif (mod.research.has('Kitten scientists')) catMult*=(1+Game.milkProgress*0.05*milkMult)`, "after"
    )
    new Research.Tech("Supercomputers", "Direct research gains <b>+10%</b>. <q>To be fair, they take up a lot of space.</q>", 130, breq('Javascript console', 100), f, [0], [32, 0], -0.15, -0.15); //5
    new Research.Tech("Thinktank", "Direct research gains <b>+10%</b>. <q>Big brains think together!</q>", 200, breq('Cortex baker', 200), f, [5], [34, 0], -0.3, -0.5); // 6
    new Research.Tech("Cookie funding", "You passively gain research <b>faster</b> the more banks you own. <q>A backup when the government stops funding your research because of 'ethics' violations or something.</q>", 150, breq('Bank', 250), f, [2], [2, 0, Icons], 0.5, -0.3); //7
    new Research.Tech("Shiny cookies", "Unlocks <b>shiny cookies</b>, special cookies that grant a large CpS multiplier. <div class=\"line\"></div>Shiny cookies' power decreases the more you ascend.", 37, f, f, [1], [2, 1, Icons], -0.4, 0.7); // 8
    new Research.Tech("Otherworldly sight", "Unlocks <b>esoteric statistics</b>, which give much more information about the mod.", 1, f, f, [1], [27, 26], -0.2, 0.8);

    var spr_ref = [0,1,2,3,4,15,16,17,5,6,7,8,13,14,19,20,32,33,34,35];
    var tier_ref = [21,26,27];
    var buildingTree = function(i) {
        var me = Game.ObjectsById[i];
        var hfunction = function() {return (me.amount >= 1) && Research.has("Research lab")};
        new Research.Tree(me.dname, [spr_ref[i], 0], hfunction);
        var btext = me.plural;
        if (i == 0) btext = "cursors and clicking";
        new Research.Tech(me.dname+" research", "Unlocks the research tree for <b>"+btext+"</b>.", 20, f, f, [], [spr_ref[i], 0], 0, 0); //0
        me.tieredResearch = [];
    }
    // tier: 1, 2, 3
    var tieredTreeG = function(i, tier, name, desc, spc) {
        var me = Game.ObjectsById[i];
        var hfunction = breq(me.name, 100 + 100*tier);
        var deps = [0];
        if (tier > 1) deps=[me.tieredResearch[tier-2].id];
        me.tieredResearch.push(new Research.Tech(name, spc+'<q>'+desc+'</q>', 30 + 20 * tier, hfunction, f, deps, [spr_ref[i], tier_ref[tier-1]], 0.6 * tier, 0));
    }
    var tieredTree = function(i, tier, name, desc) {
        tieredTreeG(i, tier, name, desc, cfl(Game.ObjectsById[i].plural)+" yield <b>"+Beautify(100-5*i)+"%</b> more. Resource space is <b>doubled</b>.");
    }
    var bLumpBuff = function(i, name, spc, desc) {
        var me = Game.ObjectsById[i];
        var hfunction = {reqFunc:function(){return me.level >= 5},reqDesc:"upgrade this building to level 5"};
        var deps = [2];
        me.lumpBuff = new Research.Tech(name, spc+'(not yet implemented :( )<q>'+desc+'</q>', 100, hfunction, f, deps, [spr_ref[i], 22], 2.0, 0.6);
    }
    for (var i in Game.Objects) {
        Game.Objects[i].getLumpBuff = function() {
            if (!this.lumpBuff) return 0;
            if (!Research.has(this.lumpBuff.name)) return 0;
            return Math.min(this.level, 20);
        }
    }
    Research.hasTiered = function(i, tier) {
        if (!Game.ObjectsById[i].tieredResearch) return false;
        if (Game.ObjectsById[i].tieredResearch.length < tier) return false;
        return Game.ObjectsById[i].tieredResearch[tier-1].bought;
    }
    Research.unlockAll = function() {
        for (var i in this.trees) {
            this.trees[i].upgrades.forEach(function(up) {
                up.req=true;
            })
        }
    }
    // gc tree
    new Research.Tree("Golden cookies", [27, 6], function(){return Game.goldenClicks;});
    new Research.Tech("Golden cookies", "Unlocks the research tree for <b>golden cookies</b>.", 
        7, f, f, [], [10, 14], 0, 0); // 0
    new Research.Tech("Hoard of treasure", "Golden cookie gains <b>+10%</b>.", 
        27, req(() => mod.G.fortunesEarned, 3, "Fortunes"), f, [0], [27, 6], 0.3, 0.25); // 1
    new Research.Tech("The true purpose of luck", "Golden cookie frequency <b>+3%</b>.<q>...is to get more cookies.</b>", 
        37, req(() => mod.G.fortunesEarned, 17, "Fortunes"), f, [1], [27, 6], 0.6, 0.35); // 2
    new Research.Tech("Pure one-hundred-percent gold", "Golden cookie frequency <b>+5%</b>.<q>The purest gold!</q>", 
        27, f, f, [0], [27, 6], 0, 0.5); // 3
    new Research.Tech("Golden gates", "Golden cookie gains <b>doubled</b>. Each golden cookie effect active makes Fortune <b>50%</b> stronger."+
        "<q>The golden gates of heaven. Make sure the angels don't get mad.</q>",
        155, {reqFunc:function(){return false;},reqDesc:"obtain the Fortune effect while having a CpS multiplier from golden cookie effects of at least <b>x4,000</b>"}, f,
        [2], [27, 6], 0.9, 0.7); // 4
    // all the building trees go here

    buildingTree(0);
    tieredTreeG(0, 1, "Flex gloves", "Trendy, and in style!", "Cursors are <b>25%</b> more efficient."); // 1
    tieredTreeG(0, 2, "Rocket propulsor", "Slams at lightning-speed into the cookie.", "Cursors are <b>25%</b> more efficient."); // 2
    tieredTreeG(0, 3, "Autoclicker", "Huh, wonder why I never thought of this before.", "Cursors are <b>25%</b> more efficient."); // 3
    Game.Objects.Cursor.cps = en.injectChain(Game.Objects.Cursor.cps, "mult*=Game.eff('cursorCps');",
        [
            'if (mod.research.hasTiered(0, 1)) mult*=1.25;',
            'if (mod.research.hasTiered(0, 2)) mult*=1.25;',
            'if (mod.research.hasTiered(0, 3)) mult*=1.25;'
        ]
    )
    // no need for lump buff
    new Research.Tech("Fourth-dimensional workarounds", "Clicking is <b>6%</b> more powerful.", 30, req(() => Game.cookieClicks, 500, "cookie clicks"), f, [0], [1, 6], 0.3, 0.3); // 4
    new Research.Tech("Cybernetic fingers", "Clicking is <b>6%</b> more powerful. <q>Clink, clink.</q>", 50, req(() => Game.cookieClicks, 1000, "cookie clicks"), f, [4], [12, 1], 0.5, 0.6); // 5
    new Research.Tech("Repeated electrical shock", "Clicking is <b>6%</b> more powerful. <q>Ow. Ow. Ow.</q>", 70, req(() => Game.cookieClicks, 2500, "cookie clicks"), f, [5], [12, 2], 0.6, 0.9); // 6
    Game.mouseCps = en.injectChain(Game.mouseCps, "if (Game.Has('Dragon claw')) mult*=1.03;",
        [
            'if (mod.research.has("Fourth-dimensional workarounds")) mult*=1.06;',
            'if (mod.research.has("Cybernetic fingers")) mult*=1.06;',
            'if (mod.research.has("Repeated electrical shock")) mult*=1.06;'
        ]
    )
    new Research.Tech("Jitter-click", "Clicking is <b>5%</b> more powerful.", 25, req(() => Game.cookieClicks, 150, "cookie clicks"), f, [0], [11, 0], -0.2, -0.1); // 7
    new Research.Tech("Sustainable clicks", "Overflow accumulates <b>25%</b> slower.<q>Remember to ride your clickcycle to work!</q>", 45, f, f, [7], [11, 1], -0.5, -0.2); // 8
    new Research.Tech("Damage control", "Decreases overflow effect on clicks used by <b>20%</b>.<q>If it's too much, just ascend.</q>", 85, f, f, [8], [11, 15], -0.8, -0.3); // 9
    new Research.Tech("Patience", "Increases click regeneration by <b>30%</b>. <q>A watched pot never boils.</q>", 90, f, f, [8], [11, 21], -0.6, -0.5); // 10
    new Research.Tech("Malevolent power", "Clicking is <b>10%</b> more powerful <b>per level of overflow</b>.<q>I have mastered thy enemy.</q>", 267, f, f, [9, 10], [12, 0], -1.0, -0.7); // 11 
    new Research.Tech("Temporal stretch", "Decreases overflow effect on clicks used by <b>20%</b>.<q>Stretching time really helps with the rapid clicking issue.</q>", 
        123, breq('Time machine', 250), f, [9], [11, 16], -1.1, -0.15); // 12
    new Research.Tech("Fractal absorption", "Decreases overflow effect on clicks used by <b>20%</b>.<q>Just don't question it.</q>", 
        145, breq('Fractal engine', 450), f, [12], [11, 17], -1.4, 0); // 13
    buildingTree(1);
    tieredTreeG(1, 1, "Jumbo rolling pins", "Really helps them get to work.", "Grandmas are <b>15%</b> more efficient."); // 1
    tieredTreeG(1, 2, "Hair whitener", "Studies show that the whiter the grandmas' hair is, the older they are, and therefore, the more powerful they are.", "Grandmas are <b>15%</b> more efficient.") // 2
    tieredTreeG(1, 3, "Other people's grandmas", "You sure do seem to have a lot of grandmas. But! If you pull grandmas from other people, you might be able to get even more grandmas.", "Grandmas are <b>15%</b> more efficient.") // 3
    bLumpBuff(1, "Cotton-candy grandmas", "Grandma types are <b>4%</b> more powerful per grandma level (up to level 20).", "Cotton candy injected via IV.");
    var unlockGP = {reqFunc: function(){return Game.elderWrath>0;}, reqDesc: "start the <b>grandmapocalypse</b>"}
    
    
    //WRINKLERS
    Game.inRect = function(x,y,rect)
    {
        //find out if the point x,y is in the rotated rectangle rect{w,h,r,o} (width,height,rotation in radians,y-origin) (needs to be normalized)
        //I found this somewhere online I guess
        var dx = x+Math.sin(-rect.r)*(-(rect.h/2-rect.o)),dy=y+Math.cos(-rect.r)*(-(rect.h/2-rect.o));
        var h1 = Math.sqrt(dx*dx + dy*dy);
        var currA = Math.atan2(dy,dx);
        var newA = currA - rect.r;
        var x2 = Math.cos(newA) * h1;
        var y2 = Math.sin(newA) * h1;
        if (x2 > -0.5 * rect.w && x2 < 0.5 * rect.w && y2 > -0.5 * rect.h && y2 < 0.5 * rect.h) return true;
        return false;
    }
    eval("Game.UpdateWrinklers="+Game.UpdateWrinklers.toString().replace('me.sucked*=toSuck;','me.sucked*=(toSuck*Game.getSuckMultiplier());')
        .replace(`if (Game.Has('Unholy bait')) chance*=5;`,`if (Game.Has('Unholy bait')) chance*=(2*Game.getWrinklerSpawnMultiplier());`)
        .replace(`inRect`,`Game.inRect`));
    // kinda hacky but i'll take it
    en.ue.strReplace(Game.Upgrades['Unholy bait'],'5 times', 'twice');
    new Research.Tech("Hyperfolded digestion", "Wrinklers explode into <b>twice</b> as much cookies. <small>(Note: base wrinkler digestion is nerfed.)</small> Unlocks <b>new wrinkler upgrades</b>.", 66, unlockGP, 
        function(){Game.Unlock("Genetic breeder");}, [0], [19, 8], 0, 0.3); // 5
    new Research.Tech("Enticing waft", "Wrinklers appear <b>twice</b> as fast. <small>(Note: base wrinkler spawnrate is nerfed.)</small> Unlocks <b>new wrinkler upgrades</b>.", 88, unlockGP, 
        function(){Game.Unlock("Cookie crumb trail");}, [5], [19, 8], 0, 0.6); // 6


    Game.getSuckMultiplier=function() {
        var mult=1;
        if (Research.has("Hyperfolded digestion")) mult*=2;
        if (Game.Has("Genetic breeder")) mult*=1.66;
        if (Game.Has("Psychic signal implant")) mult*=1.66;
        if (Game.Has("Eating contests")) mult*=1.66;
        if (Game.Has("Safety hangings")) mult*=1.66;
        return mult/3;
    }

    Game.getWrinklerSpawnMultiplier=function() {
        var mult=1;
        if (Research.has("Enticing waft")) mult*=2;
        if (Game.Has("Cookie crumb trail")) mult*=1.66;
        return mult/2;
    }

    var digestStr="Wrinklers explode into <b>66%</b> more cookies.";
    en.ue.addUpgrade('Genetic breeder', digestStr+'<q>Took a long while to capture those wrinklers, but we did it... And one of them escaped already.</q>', 6.666*1e15, [19,8], 15000, 
        {buyFunction:function(){Game.Unlock("Psychic signal implant");}})
    en.ue.addUpgrade('Psychic signal implant', digestStr+'<q>Eat my cookies, or else.</q>', 6.666*1e20, [19,8], 15000, 
        {buyFunction:function(){Game.Unlock("Eating contests");}})
    en.ue.addUpgrade('Eating contests', digestStr+'<q>Speaking of eating...</q>', 6.666*1e25, [19,8], 15000, 
        {buyFunction:function(){Game.Unlock("Safety hangings");}})
    en.ue.addUpgrade('Safety hangings', digestStr+'<q>Wrinklers can often fall off the big cookie for a few seconds due to their sliminess, leading to a loss in digestion. These tooth-fitting hangings will prevent that.</q>', 6.666*1e30, [19,8], 15000, 
        {buyFunction:function(){}})
    
    var spawnStr="Wrinklers spawn <b>66%</b> more often.";
    en.ue.addUpgrade('Cookie crumb trail', spawnStr+'<q>A trail of cookie crumbs leading to the big cookie.</q>', 6.666*1e16, [19,8], 15000, 
        {buyFunction:function(){}})
    
    buildingTree(2);
    tieredTree(2, 1, "Monocookie agriculture", "Gearing your farms to only cultivate cookies."); // 1
    tieredTree(2, 2, "Better hoes", "Actually, scratch that. Who would waste netherite on a hoe?"); // 2
    tieredTree(2, 3, "Radiative therapy", "Radiation increases the chance for cookie plants to mutate and become more useful. For example, a carnivorous plant with the ability to speak is already being used as a deterrent to greedy young kids.")
    bLumpBuff(2, "Caramel fertilizer", "Resource-tied buildings yield <b>2.5%</b> more per farm level (up to level 20).", "Dear Baker, what do they put in this stuff nowadays?");
    new Research.Tech("Regrowth", "Farms yield <b>three times</b> more. <div class=\"line\"></div> You can <b>reuse depleted land</b>, effectively ignoring resource depletion. <q>A masterful resource-saving invention! Wait, isn't this how agriculture is supposed to work? </q>", 230, breq('Farm', 75), f, [0], [2, 35], 0.8, 0.8); // 1
    buildingTree(3);
    tieredTree(3, 1, "Mineral scentilocation", "Recent advances have led to the creation of a machine that can detect tasty minerals via their natural scent-giving properties.") // 1
    tieredTree(3, 2, "Nanomining", "Scratch all the giant drills and pickaxes! The fabric of reality itself has been found to contain fundamental particles that can be made into cookies. This will surely have no unforeseen consequences on the stability of the universe, y'know?") // 2
    tieredTree(3, 3, "Quantum tunneling", "I... don't think that's what it's supposed to mean.") // 3
    bLumpBuff(3, "Candy cane drill", "Buildings sell back for <b>2%</b> more per mine level (up to level 20).","These things don't even work! What use could they possibly be for?")
    //eval('Game.Object.prototype.getSellMultiplier='+Game.Object.prototype.getSellMultiplier.toString().replace('var giveBack=0.25;','var giveBack=0.25+Game.Objects.Mine.getLumpBuff()*0.02;'));
    buildingTree(4);
    tieredTree(4, 1, "Lubricant", "Cleans up those old gears and machines and gets them back to working in no time!") // 1
    tieredTree(4, 2, "Fuel aeration", "A new mechanism that conserves fuel used while making it more powerful.") // 2
    tieredTree(4, 3, "Brownian ratchet gears", "They run infinitely and infinitely, with absolutely no energy put in. I guess your cookies are breaking the laws of physics?") // 3
    bLumpBuff(4, "Chocolate gears", "Upgrades are <b>3%</b> cheaper per factory level (up to level 20).","I think someone got lazy with the upgrade ideas again.")
    //eval('Game.Upgrade.prototype.getSellMultiplier='+Game.Upgrade.prototype.getSellMultiplier.toString().replace('price*=Game.eff(\'upgradeCost\');','price*=Game.eff(\'upgradeCost\');\n\t\tprice*=Math.pow(0.97,Game.Objects.Factory.getLumpBuff());'));
    buildingTree(5);
    tieredTree(5, 1, "Cookiecoin", "Your new cookie-themed crypto currency, to make cookies off of all those crypto nerds.") // 1
    tieredTree(5, 2, "Financial gobbledygook", "This makes your banking system more legitimate and less likely to get investigated by those pesky government agents.") // 2
    tieredTree(5, 3, "Shinier vaults", "Highly inviting for potential burglars! This leads to all your money being stolen by-wait, where were we, again?") // 3
    buildingTree(6);
    var hasPantheon={
        reqFunc: function(){return Game.Objects.Temple.minigame},
        reqDesc: "unlock the Pantheon"
    }
    new Research.Tech("Polytheism", "Decreases worship slot refill time by <b>25%</b>.<q>Worshipping all of your gods at once makes them more willing to cooperate.</q>", 50, hasPantheon, f, [0], [11, 6], 0, 0.5); // 1
    new Research.Tech("Creation star", "All buildings are <b>5%</b> cheaper.<q>Warning: do not touch.</q>", 75, hasPantheon, f, [1], [26, 18], 0.3, 0.8); // 2
    Game.modifyBuildingPrice = en.injectCode(Game.modifyBuildingPrice, "if (building.fortune && Game.Has(building.fortune.name)) price*=0.93;",
        '\n\tif (mod.research.has("Creation star")) price*=0.95;', "after"
    )
    new Research.Tech("Holiday coupon", "All upgrades are <b>10%</b> cheaper if a season is currently active.<q>Big discount! You can't miss out!</q>", 75, hasPantheon, f, [1], [25, 18], 0, 0.9); // 3
    Game.Upgrade.prototype.getPrice = en.injectCode(Game.Upgrade.prototype.getPrice, "if (Game.hasBuff('Haggler\'s misery')) price*=1.02;",
        '\n\tif (mod.research.has("Holiday savings") && Game.season!="") price*=0.9;', "after"
    )
    Research.numWrinklers = function() {
        var n=0;
        for (var i in Game.wrinklers) {
            if (Game.wrinklers[i].phase>0) n++;
        }
        return n;
    }
    new Research.Tech("Tooth of the wyrm", "Wrath cookies spawn <b>3%</b> more often per wrinkler present.", 75, hasPantheon, f, [1], [21, 19], -0.3, 0.8); // 4
    Game.shimmerTypes.golden.getTimeMod = en.injectCode(Game.shimmerTypes.golden.getTimeMod, "if (Game.Has('Gold hoard')) m=0.01;",
        '\n\tif (mod.research.has("Tooth of the wyrm") && me.wrath) m*=(1-0.03*mod.research.numWrinklers());', "after"
    )
    tieredTree(6, 1, "Summoning artifacts", "Mysteriously shiny artifacts that trick people into giving them a handshake, therefore forfeiting their soul to the devils within.") // 5
    tieredTree(6, 2, "Holy light of cookie heaven", "Psst, don't tell people it's just a lightbulb suspended above you with strings.") // 6
    tieredTree(6, 3, "Lovecraftian mythos", "If we feed them cookies, we should be able to get them to like us.") // 7
    bLumpBuff(6, "Sugary marble", "Worship swaps regenerate <b>20%</b> faster per temple level (up to level 20).","When the marble collapses, the gods take it as a good sign."); // 8
    buildingTree(7);
    tieredTree(7, 1, "Magic-made wands", "Generates a perpetual cycle of usage and creation.") // 1
    tieredTree(7, 2, "Broomsticks", "Old cliche, but still works for the most part.") // 2
    tieredTree(7, 3, "The science of magic", "Back in my day, people were claiming magic was actually electromagnetic waves! What schauffish baloney!") // 3
    buildingTree(8);
    tieredTree(8, 1, "Railgun", "Not actually used to launch ships. Your operators just like shooting stuff at birds.") // 1
    tieredTree(8, 2, "Cosmic trade routes", "Conveniently, they only trade cookies, and they also happen to be non-voluntary one-way roads towards your cookie empire.") // 2
    tieredTree(8, 3, "Ignoring the laws of physics", "Works like a charm! Every science fiction writer always does this!") // 3
    buildingTree(9);
    tieredTree(9, 1, "Purification gas", "You can spray it over literally anything, and the result will always be better.") // 1
    tieredTree(9, 2, "Philosopher's dough", "The ultimate goal of alchemical science, finally achieved!")
    tieredTree(9, 3, "Nuclear transmutation", "Transmutation can actually be performed with scientific (yuck) means. You can change gold into carbon by removing 73 protons and 112 neutrons. Shouldn't be that difficult, actually.") // 3
    buildingTree(10);
    tieredTree(10, 1, "Backwords cookie-summoning chants", "One popular chant goes 'Seikooc em evig! SEIKOOC EM EVIG!'.") // 1
    tieredTree(10, 2, "Rift between rifts", "Congrats, you've managed to create a portal that connects to the weird void between cookie-filled dimensions. In practice, you can just use this as your new headquarters. As if your employees WANTED to see their families again! Hah!") // 2
    tieredTree(10, 3, "The demon that comes when they call its name", "So I can just say [redacted] and he'll be summ-OH GOD") // 3
    buildingTree(11);
    tieredTree(11, 1, "Twin cookies paradox", "If you leave one cookie in a time machine and another cookie on Earth, the time machine cookie will be more cookie than cookie cookie cookie.") // 1
    tieredTree(11, 2, "Stealth operations", "You can use your newfound time powers to hijack cookie production chains from the very beginning of the universe.") // 2
    tieredTree(11, 3, "To the very end of the universe", "Man, it is really dark out here.") // 3
    buildingTree(12);
    tieredTree(12, 1, "Grand unified theory of milk", "According to one GUT, milk is a substance created in the Big Bang by the breaking apart of special molecules called chiptraeons.") // 1
    tieredTree(12, 2, "Entanglement", "It could theoretically allow communication between objects faster than the speed of light, and by extension, cookie production faster than the speed of light.") // 2
    tieredTree(12, 3, "The larger scale", "Take a step back. Know that all the weird cookie particles combine to make effects on the large scale that are easier to understand.") // 3
    buildingTree(13);
    tieredTree(13, 1, "It's all light and mirrors", "Well, that's surprising.") // 1
    tieredTree(13, 2, "Dyson spheres", "You know, all that light stars produce is practically wasted. It would have much more use if you used futuristic panels to harness it all and convert it into cookies.") // 2
    tieredTree(13, 3, "Pair instability", "It turns out, that according to new scientific developments, light harnessed by prisms can become so powerful that its energy is temporarily drained towards the production of cookies. This, of course, means more cookies.") // 3
    buildingTree(14);
    tieredTreeG(14, 1, "Luck in the air", "Literally!", "Chancemakers are <b>77%</b> more efficient. Golden cookie gains <b>+77%</b>.") // 1
    tieredTreeG(14, 2, "Unfair dice", "Can also be used to annoy people at DnD games.", "Chancemakers are <b>57%</b> more efficient. Golden cookie gains <b>+57%</b>.") // 2
    tieredTreeG(14, 3, "The law of large numbers of cookies", "States that the more cookies you have, the more luck you're bound to get.", "Chancemakers are <b>37%</b> more efficient. Golden cookie gains <b>+37%</b>.") // 3
    // Game.shimmerTypes.golden.popFunc = en.injectChain(Game.shimmerTypes.golden.popFunc, "if (Game.Has('Dragon fang')) mult*=1.03;",
    //     [
    //         'if (mod.research.hasTiered(14, 1)) mult*=1.77;',
    //         'if (mod.research.hasTiered(14, 2)) mult*=1.57;',
    //         'if (mod.research.hasTiered(14, 3)) mult*=1.37;',
    //         'if (mod.research.has("Hoard of treasure")) mult*=2;',
    //         'if (mod.research.has("The true purpose of luck")) mult*=2;'
    //     ]
    // )
    // Game.shimmerTypes.golden.getTimeMod = en.injectChain(Game.shimmerTypes.golden.getTimeMod, "if (Game.Has('Green yeast digestives')) m*=0.99;",
    //     [
    //         'if (mod.research.has("Pure one-hundred-percent gold")) m*=0.95;',
    //     ]
    // )
    en.addGcHook('gains',function(m){return m*(mod.research.hasTiered(14, 1)?1.77:1)})
    en.addGcHook('gains',function(m){return m*(mod.research.hasTiered(14, 2)?1.57:1)})
    en.addGcHook('gains',function(m){return m*(mod.research.hasTiered(14, 3)?1.37:1)})
    en.addGcHook('gains',function(m){return m*(mod.research.has("Hoard of treasure")?1.10:1)})
    en.addGcHook('frequency',function(m){return m/(mod.research.has("Pure one-hundred-percent gold")?1.05:1)})
    en.addGcHook('frequency',function(m){return m/(mod.research.has("The true purpose of luck")?1.03:1)})
    Game.Objects.Chancemaker.cps = en.injectChain(Game.Objects.Chancemaker.cps, "mult*=Game.magicCpS(me.name);", 
        [
            'if (mod.research.hasTiered(14, 1)) mult*=1.77;',
            'if (mod.research.hasTiered(14, 2)) mult*=1.57;',
            'if (mod.research.hasTiered(14, 3)) mult*=1.37;'
        ]
    )
    buildingTree(15);
    tieredTree(15, 1, "Fractalized cookies", "If you look carefully enough at the edge of them, you'll find tiny cookies that look exactly the same as the big one.") // 1
    tieredTree(15, 2, "Mathematics department", "Creating a pure math department for your research helps immensely with CpS. Not a sentence you'd expect to see.") // 2
    tieredTree(15, 3, "Self-reflective material", "It's like the OBS screen effect when you aren't recording anything, but you put a cookie on it.") // 3
    buildingTree(16);
    tieredTree(16, 1, "Multithreading", "Splits code into many different threads, which all produce cookies simultaneously.") // 1
    tieredTree(16, 2, "If there was a computer for every atom of the observable universe, running 13.8 billion years from the Big Bang to the present day...", "...but you actually made them do that.") // 2
    tieredTree(16, 3, "The old days", "Look back in time for inspiration. Did you know that Git was originally a large van?") // 3
    buildingTree(17);
    new Research.Tech("Galactica mindoris", "You gain <b>more resource space</b> the more idleverses you have. <q>Turns out there's a ton of room in idleverses!</q>", 410, f, f, [0], [33, 35], 0, 1.5);
    tieredTreeG(17, 1, "Converter", "A machine to convert all matter in an idleverse to cookies. Don't tell any Cookieclysm devs.", "Idleverses are <b>30%</b> more efficient.") // 1
    tieredTreeG(17, 2, "Testing worlds", "You've managed to repurpose some of your idleverses as multiverse-size guinea pigs for experiments with stuff. Good thing those lawyers have been strangely quiet recently.", "Idleverses are <b>30%</b> more efficient.") // 2
    tieredTreeG(17, 3, "The marble ball conjecture", "The marble ball conjecture states that our entire multiverse may be only the size of a small marble ball in another multiverse. This means you have even more dimensions to take over.", "Idleverses are <b>30%</b> more efficient.") // 3
    buildingTree(18);
    tieredTree(18, 1, "Headspace expansion", "With all those problems about space, you figured your cortex bakers can probably just think up more space.") // 1
    tieredTree(18, 2, "Cerebral lubricant", "You don't want all those big brains getting in themselves' way, do you?") // 2
    tieredTree(18, 3, "Imagination", "The ultimate power. Your cortex bakers don't have very much of it, but you can just spike some imagination juice into their drinks. After all, anything is possible when you IMAGINIZE it!") // 3
    buildingTree(19);
    tieredTree(19, 1, "DNA Splicers", "With these handy splicers, you can splice the best and most useful genes from other organisms directly into a clone.") // 1
    tieredTree(19, 2, "Vitality transfer", "Transferring lifeforce between your clones makes it generally last longer.") // 2
    tieredTree(19, 3, "Genetic clone selection", "Recloning the DNA of existing clones allows natural selection to take place, as due to errors in the gene copying mechanism, some clones are more efficient than others. Maybe, with enough time, they could even surpass you?") // 3

    this.setCurrTree("General");

    // stats n' switches

    // for (var i in Research.trees) {
    //     Research.trees[i].upgrades.forEach(function(up) {
    //         en.newVar("research" + i + up.id, "int");
    //     })
    // }

    en.saveCallback(function() {
        en.setVar("research", Research.research);
        // for (var i in Research.trees) {
        //     Research.trees[i].upgrades.forEach(function(up) {
        //         en.setVar("research" + i + up.id, up.bought ? 1 : 0);
        //     })
        // }
        en.setVar("techData", Research.writeSave());
    })

    en.loadCallback(function() {
        Research.research = en.getVar("research", Research.research);
        // for (var i in Research.trees) {
        //     Research.trees[i].upgrades.forEach(function(up) {
        //         var n = en.getVar("research" + i + up.id, up.bought);
        //         if (n == 0) up.bought = false;
        //         if (n == 1) up.bought = true;
        //     })
        // }
        Research.loadSave(en.getVar("techData"), Research.writeSave());
    })

    Game.registerHook('reset', function(wipe) {
        if (wipe) {
            Research.research = 0;
            for (var i in Research.trees) {
                Research.trees[i].upgrades.bought = false;
            }
            Research.numUpgrades = 0;
        }
    });

    Game.registerHook('reincarnate', function() {
        if (Game.ascensionMode == 0) Research.button.style.display = 'block';
        else Research.button.style.display = 'none';
    });

    Game.registerHook('logic', function() {
        Research.update();

        if (Research.has("Hyperfolded digestion")) Game.Unlock("Genetic breeder");
        if (Research.has("Enticing waft")) Game.Unlock("Cookie crumb trail");
    });

    Game.registerHook('check', function() {
        Research.draw();
        for (var i in Research.trees) {
            Research.trees[i].upgrades.forEach(function(up) {
                up.check();
            })
        }
        if (Research.numUpgrades>=20) Game.Win("Doctorate");
        if (Research.numUpgrades>=50) Game.Win("Researcher");
    });

    Game.registerHook('cps', function(cps) {
        var mult = 1;
        if (Research.has("Plain cookie")) mult *= 1.05;
        return cps * mult;
    });
}

export { Research }