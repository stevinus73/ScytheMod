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
        this.parents = parents;
        this.sprite = sprite;
        this.x = x; // -1 to 1
        this.y = y; // -1 to 1
        this.id = Research.id;
        this.bought = false;

        this.canBuy = function() {
            var parentBuy = true;
            for (var parent in this.parents) {
                if (!parent.canBuy()) parentBuy = false;
            }
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
            var str = '';
            str += '<div class="description"><div style="margin:6px 0px;font-size:14px;"><b>'+this.name+'</b></div>';
            str += '<div style="margin:6px 0px;font-size:11px;">'+this.desc+'</div>';
            str += '</div>';
            return str;
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
        if (userX < -1200) userX = -1200;
        if (userY < -1200) userY = -1200;
        if (userX >  1200) userX =  1200;
        if (userY >  1200) userY =  1200;
    }

    

    function f(){return true;}
    new Research.Tech("Magic mushrooms", "They make you magic!", 10, f, f, [], [23, 10], 0, 0);
    new Research.Tech("Howdy!", "It's me. Flowery.", 10, f, f, [], [26, 11], -0.4, 0.6);

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