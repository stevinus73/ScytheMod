var Research = {};

Research._Initialize = function(en) {
    this.en = en;

    var str = '';
    str += '<div class="smallFancyButton framed" id="researchButton" style="margin-top: 0px; position:relative;' 
    str += 'background: url(//cdn.dashnet.org/cookieclicker/img/shadedBorders.png),url(//cdn.dashnet.org/cookieclicker/img/BGgrimoire.jpg)" '
    str += 'onclick="mod.research.switch(-1)">'
    str += '<div>View Research</div></div>'
    l("comments").insertAdjacentHTML('beforeend','<div id="researchDisplay"></div>')
    l("buildingsMaster").insertAdjacentHTML('afterbegin', str);
    this.button = l("researchButton");
    this.researchOn = false;
    l("centerArea").insertAdjacentHTML('beforeend', 
        '<style>#research{z-index: 1; background: url("img/starbg.jpg"); position: absolute; inset: 40px 0px 0px; display: none;}'+
        '#researchDisplay{cursor: pointer; position: absolute; right: 0px; bottom: -12px; width: 32px; height: 32px; z-index: 1000; filter:drop-shadow(0px 3px 2px #000); -webkit-filter:drop-shadow(0px 3px 2px #000);}'+
        '#researchIcon{width: 48px; height: 48px; right: -8px; top: -8px; position: absolute; pointer-events: none;}'+
        '#researchAmount{font-size: 12px; color: #6cf; position: absolute; right: 36px; top: 6px; text-align: right; width: 200px;}'+
        '.research.price:before{width:48px;height:48px;left:-24px;top:-10px;background:url("img/icons.png");'+writeIcon([9,0])+'}'+
        '#researchButton{cursor: pointer;}</style>'
    )
    l("centerArea").insertAdjacentHTML('beforeend', '<div id="research"></div>')
    this.container = l("research");
    this.container.insertAdjacentHTML('beforeend', '<div id="researchCrates"></div>')
    this.crates = l("researchCrates");
    this.container.insertAdjacentHTML('beforeend', '<div id="researchContent" style="position: absolute;"></div>')
    this.content = l("researchContent");
    this.display = l("researchDisplay");
    this.display.insertAdjacentHTML('beforeend', '<div id="researchIcon" class="usesIcon" style="'+writeIcon([9,0])+'"></div>')
    this.display.insertAdjacentHTML('beforeend', '<div id="researchAmount"></div>')
    this.num = l("researchAmount");
    this.research = 15;

    this.userX = 0;
    this.userY = 0;
    this.userXT = 0;
    this.userYT = 0;
    this.userDragX = 0;
    this.userDragY = 0;
    this.dragging = false;

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
        this.onBuy = onBuy;
        this.parents = Array.from(parents, (i) => this.tree.upgrades[i]);
        this.sprite = sprite;
        this.x = x; // -1 to 1
        this.y = y; // -1 to 1
        this.id = this.tree.id;
        this.bought = false;

        this.canBuy = function() {
            var parentBuy = true;
            this.parents.forEach(function(parent) {
                if (!parent.bought) parentBuy = false;
            });
            return (this.requirements() && parentBuy && (Research.research >= this.priceR));
        }

        this.buy = function() {
            if ((!this.canBuy()) || this.bought) return;
            Research.research -= this.priceR;
            this.bought = true;
            this.onBuy();
            Research.draw();
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
            var sX =  this.x * Research.container.offsetWidth  * 0.5 + cX;
            var sY = -this.y * Research.container.offsetHeight * 0.5 + cY;
            return {posX: sX, posY: sY};
        }

        this.isAvailable = function() {
            var available = false;
            this.parents.forEach(function(parent) {
                if (parent.bought) available = true;
            });
            if (this.parents.length == 0) available = true;
            if (!this.requirements()) available = false;
            if (this.bought) available = true;
            return available;
        }

        this.draw = function() {
            var available = this.isAvailable();
            var sX = this.getPosition().posX;
            var sY = this.getPosition().posY;
            var classes = 'crate upgrade heavenly';
            var clickStr = available ? 'mod.research.currTree.upgrades[' + this.id + '].buy()' : ''; 
            var enabled = 0;
            if (this.bought) enabled=1;
            if (enabled) classes += ' enabled';
            return '<div data-id="'+this.tree.name+this.id+'" '+Game.clickStr+'="'+clickStr+'"'+
            ' class="'+classes+'" '+Game.getDynamicTooltip('function(){return mod.research.currTree.upgrades['+this.id+'].getTooltip()}', 'top', true)
            +'id="researchUp'+this.tree.name+this.id+'" '+
            'style="'+writeIcon(this.sprite)+'position:absolute;left:'+sX+'px;top:'+sY+'px;'+(available?'':'display:none;')+'"></div>';
        }

        this.getTooltip = function() {
            var tags = [];
            var price='';

            tags.push(loc("[Tag]Tech",0,'Tech'),'#36a4ff');
            if (this.bought) {
                tags.push(loc("Researched"),0);
            }

            var tagsStr='';
            for (var i=0;i<tags.length;i+=2)
            {
                if (i%2==0) tagsStr+='<div class="tag" style="background-color:'+(tags[i+1]==0?'#fff':tags[i+1])+';">'+tags[i]+'</div>';
            }
            var cost=this.priceR;
            price='<div style="float:right;text-align:right;"><span class="price research'+ (this.canBuy() ? '' : ' disabled') +'">'+Beautify(Math.round(cost))+'</span></div>';
            var tip=(this.canBuy() && !this.bought) ? loc("Click to research.") : "";

            return '<div style="position:absolute;left:1px;top:1px;right:1px;bottom:1px;background:linear-gradient(125deg,rgba(50,40,40,1) 0%,rgba(50,40,40,0) 20%);mix-blend-mode:screen;z-index:1;"></div><div style="z-index:10;padding:8px 4px;min-width:350px;position:relative;" id="tooltipCrate'+this.tree.name+this.id+'">'+
            '<div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;'+writeIcon(this.sprite)+'"></div>'+price+
            '<div class="name">'+this.name+'</div>'+tagsStr+
            '<div class="line"></div><div class="description">'+this.desc+'</div></div>'+
            (tip!=''?('<div class="line"></div><div style="font-size:10px;font-weight:bold;color:#999;text-align:center;padding-bottom:4px;line-height:100%;" class="crateTip">'+tip+'</div>'):'');
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

        this.getCrate = function() {
            if (!this.requirements()) return '';
            var classes = 'crate upgrade';
            if (this.curr) classes += ' enabled';
            var clickStr = 'mod.research.setCurrTree("'+this.name+'");mod.research.draw();';
            return '<div data-id="'+this.name+"tree"+'" '+Game.clickStr+'="'+clickStr+'"'+
            ' class="'+classes+'" id="researchTreeCrate'+this.name+'" '+
            'style="'+writeIcon(this.sprite)+'"></div>';
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
            this.button.firstChild.textContent = "Close Research";
            this.draw();
        } else {
            this.container.style.display = "none";
            l("rows").style.display = "block";
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

    Research.clear = function() {
        this.switch(false);
    }

    Research.draw = function() {
        if (!this.researchOn) return;
        this.content.innerHTML = this.currTree.draw();
        var crateStr = '';
        for (var i in this.trees) {
            crateStr += this.trees[i].getCrate();
        }
        this.crates.innerHTML = crateStr;
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
        if (Game.mouseDown && !Game.promptOn) {
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
        if (Game.onMenu != '') this.switch(false);

        this.num.textContent = this.research;
    }

    Research.setCurrTree = function(treeName) {
        if (this.currTree) this.currTree.curr = false;
        this.currTree = this.trees[treeName];
        this.trees[treeName].curr = true;
    }

    Research.has = function(name) {
        for (var i in this.trees) {
            if (this.trees[i].has(name)) return true;
        }
        return false;
    }

    Research.earnAchiev = function() {
        this.research += 10;
    }
    Game.Win = en.injectCode(Game.Win, 'it.won=1;', 'mod.research.earnAchiev();', "after");
    

    function f(){return true;}

    new Research.Tree("General", [10, 0], f);

    new Research.Tech("Research lab", "Unlocks the <b>Research tree</b>, where you can buy upgrades using research (the number in the top right corner). <div class=\"line\"></div> You gain research in a variety of ways. <div class=\"line\"></div> Research upgrades are kept across ascensions. <q>It's quite small, but so is your current business.</q>", 1, f, f, [], [9, 2], 0, 0); //0
    new Research.Tech("Plain cookie", "Cookie production multiplier <b>+5%</b>. <div class=\"line\"></div> Unlocks <b>new cookie upgrades</b> that appear once you have enough cookies. <q>We all gotta start somewhere. </q>", 50, f, f, [0], [2, 3], -0.4, 0.6); //1
    new Research.Tech("Interns", "You <b>gain reseach passively</b>, at a rate of <b>1 research per 15 minutes</b>. <q>They do research for you when you're gone. Sure, they may just be drinking all the test tubes and fighting each other with meter sticks, but it's the effort that counts. </q>", 10, f, f, [0], [9, 0], 0.3, 0); //2
    function has100Banks(){return (Game.Objects['Bank'].amount >= 100);}
    new Research.Tech("Cookie funding", "You gain <b>more research passively</b> the more banks you own. <q>A backup when the government stops funding your research because of 'ethics' violations or something.</q>", 330, has100Banks, f, [2], [26, 11], 0.5, -0.3); //3

    spr_ref = [0,1,2,3,4,15,16,17,5,6,7,8,13,14,19,20,32,33,34,35];
    var buildingTree = function(i) {
        var me = Game.ObjectsById[i];
        var hfunction = function() {return (me.amount >= 1)};
        new Research.Tree(me.dname, [spr_ref[i], 0], hfunction);
        var btext = me.plural;
        if (i == 0) btext = "cursors and clicking";
        new Research.Tech(me.dname+" research", "Unlocks the research tree for <b>"+btext+"</b>.", 20, f, f, [], [spr_ref[i], 0], 0, 0); //0
    }

    buildingTree(0);
    buildingTree(1);
    buildingTree(2);
    buildingTree(3);
    buildingTree(4);
    buildingTree(5);
    buildingTree(6);
    buildingTree(7);
    buildingTree(8);
    buildingTree(9);
    buildingTree(10);
    buildingTree(11);
    buildingTree(12);
    buildingTree(13);
    buildingTree(14);
    buildingTree(15);
    buildingTree(16);
    buildingTree(17);
    buildingTree(18);
    buildingTree(19);

    this.setCurrTree("General");

    Research.en.saveCallback(function() {

    })

    Research.en.loadCallback(function() {

    })

    Game.registerHook('logic', function() {
        Research.update();
    });

    Game.registerHook('check', function() {
        Research.draw();
    });

    Game.registerHook('cps', function(cps) {
        var mult = 1;
        if (Research.has("Plain cookie")) mult *= 1.05;
        return cps * mult;
    });
}

export { Research }