var Research = {};

Research._Initialize = function(en) {
    this.en = en;

    var str = '';
    str += '<div class="smallFancyButton framed" id="researchButton" style="margin-top: 0px; position:relative;' 
    str += 'background: url(//cdn.dashnet.org/cookieclicker/img/shadedBorders.png),url(//cdn.dashnet.org/cookieclicker/img/BGgrimoire.jpg)" '
    str += 'onclick="mod.research.switch(-1)">'
    str += '<div>View Research</div></div>'

    l("buildingsMaster").insertAdjacentHTML('afterbegin', str);
    this.button = l("researchButton");
    this.researchOn = false;
    l("centerArea").insertAdjacentHTML('beforeend', 
        '<style>#research{background: url("img/starbg.jpg"); z-index: 1; position: absolute; inset: 40px 0px 0px; display: none;}</style>'
    )
    l("centerArea").insertAdjacentHTML('beforeend', '<div id="research"></div>')
    this.container = l("research");
    this.research = 0;

    this.upgrades = [];
    this.userX = 0;
    this.userY = 0;
    this.id = 0;

    Research.Tech = function(name, desc, priceR, requirements, onBuy, parents, sprite, x, y) {
        Research.upgrades.push(this);
        this.name = name;
        this.desc = desc;

        this.priceR = priceR;
        this.requirements = requirements;
        this.onBuy = onBuy;
        this.parents = Array.from(parents, (i) => Research.upgrades[i]);
        this.sprite = sprite;
        this.x = x; // -1 to 1
        this.y = y; // -1 to 1
        this.id = Research.id;
        this.bought = false;

        this.canBuy = function() {
            var parentBuy = true;
            this.parents.forEach(function(parent) {
                if (!parent.canBuy()) parentBuy = false;
            });
            return (this.requirements() && parentBuy && (Research.research >= this.priceR) && !this.bought);
        }

        this.buy = function() {
            Research.research -= this.priceR;
            this.bought = true;
            this.onBuy();
        }

        this.draw = function() {
            var cX = Research.container.offsetWidth  * 0.5 - Research.userX - 36;
            var cY = Research.container.offsetHeight * 0.5 - Research.userY - 36;
            var sX =  this.x * Research.container.offsetWidth  * 0.5 + cX;
            var sY = -this.y * Research.container.offsetHeight * 0.5 + cY;
            var classes = 'crate upgrade heavenly';
            var clickStr = this.onBuy;
            var enabled = 0;
            if (this.bought) enabled=1;
            if (enabled) classes += ' enabled';
            return '<div data-id="'+this.id+'" '+Game.clickStr+'="'+clickStr+'"'+
            ' class="'+classes+'" '+Game.getDynamicTooltip('function(){return mod.research.upgrades['+this.id+'].getTooltip()}', 'top', true)
            +'id="researchUp'+this.id+'" '+
            'style="'+writeIcon(this.sprite)+'position:absolute;left:'+sX+'px;top:'+sY+'px;"></div>';
        }

        this.getTooltip = function() {
            var tags = [];
            var price='';

            tags.push(loc("[Tag]Tech",0,'Tech'),'#36a4ff');
            if (this.bought) {
                ariaText+='Owned. ';
                tags.push(loc("Researched"),0);
            }

            var tagsStr='';
			for (var i=0;i<tags.length;i+=2)
			{
				if (i%2==0) tagsStr+='<div class="tag" style="background-color:'+(tags[i+1]==0?'#fff':tags[i+1])+';">'+tags[i]+'</div>';
			}

            var cost=this.priceR;
            price='<div style="float:right;text-align:right;"><span class="price">'+Beautify(Math.round(cost))+'</span></div>';
            var tip=loc("Click to research.");

            return '<div style="position:absolute;left:1px;top:1px;right:1px;bottom:1px;background:linear-gradient(125deg,rgba(50,40,40,1) 0%,rgba(50,40,40,0) 20%);mix-blend-mode:screen;z-index:1;"></div><div style="z-index:10;padding:8px 4px;min-width:350px;position:relative;" id="tooltipCrate">'+
            '<div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;'+writeIcon(this.sprite)+'"></div>'+price+
            '<div class="name">'+this.name+'</div>'+
            tagsStr+
            '<div class="line"></div><div class="description">'+this.desc+'</div></div>'+
            (tip!=''?('<div class="line"></div><div style="font-size:10px;font-weight:bold;color:#999;text-align:center;padding-bottom:4px;line-height:100%;" class="crateTip">'+tip+'</div>'):'');
        }

        Research.id += 1;
    }

    Research.Tech.prototype.getType = function () {
        return 'TechUpgrade';
    }

    en.injectCode(Game.resize, 'Game.scale=scale;', 'mod.research.draw();', "after");








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
        }
    }

    Research.clear = function() {
        this.switch(false);
    }

    Research.draw = function() {
        if (!this.researchOn) return;
        var str = '';
        this.upgrades.forEach(function(u) {
            str += u.draw()
        })
        this.container.innerHTML = str;
    }

    Research.update = function() {
        if (Game.keys[37]) this.userX -= 4;
        if (Game.keys[38]) this.userY -= 4;
        if (Game.keys[39]) this.userX += 4;
        if (Game.keys[40]) this.userY += 4;
        if (this.userX < -1200) this.userX = -1200;
        if (this.userY < -1200) this.userY = -1200;
        if (this.userX >  1200) this.userX =  1200;
        if (this.userY >  1200) this.userY =  1200;
    }

    

    function f(){return true;}
    new Research.Tech("Magic mushrooms", "They make you magic!", 10, f, f, [], [23, 10], 0, 0); //0
    new Research.Tech("Howdy!", "It's me. Flowery.", 10, f, f, [0], [26, 11], -0.4, 0.6); //1

    Research.en.saveCallback(function() {

    })

    Research.en.loadCallback(function() {

    })

    Game.registerHook('logic', function() {
        //Research.draw();
        Research.update();
    });
}

export { Research }