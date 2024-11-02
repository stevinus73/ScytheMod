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
        '<style>#research{background: url("img/starbg.jpg"); z-index: 1; position: absolute; inset: 40px 0px 0px;}</style>'
    )
    l("centerArea").insertAdjacentHTML('beforeend', '<div id="research"></div>')
    this.container = l("research");
    // this.container.insertAdjacentHTML('beforeend',

    // )

    // this.container.insertAdjacentHTML('beforeend',
    //     '<canvas id="researchCanvas"></canvas>'
    // )

    // this.canvas = l("researchCanvas");
    // this.ctx = this.canvas.getContext("2d");

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
            return (this.requirements() && parentBuy && (Research.research >= this.priceR));
        }

        this.draw = function() {
            cX = (this.x + 1) * Research.canvas.width * 0.5 - Research.userX;
            cY = (this.y + 1) * Research.canvas.height * 0.5 - Research.userY;
            var classes = 'crate upgrade heavenly';
            var clickStr = this.onBuy;
            var enabled = 0;
            if (this.bought) enabled=1;
            if (enabled) classes += ' enabled';
            return '<div data-id="'+this.id+'" '+Game.clickStr+'="'+clickStr+'"'+
            ' class="'+classes+'" '+Game.getDynamicTooltip('function(){return mod.research.upgrades['+this.id+'].getTooltip()}', 'top', true)
            +'id="researchUp'+this.id+'" '+
            'style="'+writeIcon(this.sprite)+'position:absolute;left:'+cX+'px;top:'+cY+'px;'+
                (style||'')+'"></div>';
        }

        this.getTooltip = function() {
            return '<div class="description"><div style="margin:6px 0px;font-size:11px;"><b>'+this.name+'</b></div>'+
						'<div style="margin:6px 0px;font-size:11px;">'+this.desc+'</div>'+
						""+
					'</div>';
        }

        Research.id += 1;
    }

    Research.Tech.prototype.getType = function () {
        return 'TechUpgrade';
    }








    Research.switch = function(on) {
        if (on == -1) on = !this.researchOn;
        //this.researchOn = on;
        if (this.researchOn) {
            this.container.style.display = "block";
            l("rows").style.display = "none";
            this.button.firstChild.textContent = "Close Research";
        } else {
            this.container.style.display = "none";
            l("rows").style.display = "block";
            this.button.firstChild.textContent = "View Research";
        }
    }
    this.switch(false);

    Research.clear = function() {
        this.switch(false);
    }

    Research.draw = function() {
        // this.canvas.width = this.container.width;
        // this.canvas.height = this.container.height;
        //if (Game.drawT%2==0) {
            //this.upgrades.forEach(u => u.draw());
        //}
        if (!this.researchOn) return;
        str = '';
        for (var t in this.tech) {
            str += t.draw();
        }

        //this.container.innerHTML = str;
    }

    var f = function(){return true;}
    new Research.Tech("Magic mushrooms", "They make you magic!", 10, f, f, [], [23, 10], 0, 0);

    

    //Game.crate(me,'ascend','return;','researchUpgrade','');

    Research.en.saveCallback(function() {

    })

    Research.en.loadCallback(function() {

    })

    Game.registerHook('logic', function() {
        Research.draw();
    });
}

export { Research }