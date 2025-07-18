import { injectCode, injectCodes } from "./utils.js";
import { building_engine, achiev_engine, upgrade_engine, Process } from "./constructs.js";
import "./constructs.js";

var IdlersPocket = {};


IdlersPocket.injectCode = injectCode;
IdlersPocket.injectCodes = injectCodes;
// honestly I don't really know too much about injectCode so I'm just making this for convenience
IdlersPocket.injectMult = function (func, inject, ord) {
    var ret = func;
    inject.forEach(function (code) {
        ret = IdlersPocket.injectCode(ret, code[0], code[1], ord);
    })
    return ret;
}
IdlersPocket.injectChain = function (func, begin, chain) {
    var ret = func;
    var last = begin;
    chain.forEach(function (code) {
        ret = IdlersPocket.injectCode(ret, last, "\n\n\n\t" + code, "after");
        last = code;
    })
    return ret;
}
IdlersPocket.addLoc = function (loc1, loc2) {
    locStrings[loc1] = loc2 ?? loc1;
}
IdlersPocket.be = building_engine;
IdlersPocket.ae = achiev_engine;
IdlersPocket.ue = upgrade_engine;

/**
 * STORAGE
 */

IdlersPocket.loadCallbacks = [];
IdlersPocket.saveCallbacks = [];

IdlersPocket.vars = new Map();
IdlersPocket.obj_track = [];
Game.Ip = IdlersPocket;


IdlersPocket._encryptVars = function () {
    var str = [];
    IdlersPocket.vars.forEach((value, key) => {
        str.push(utf8_to_b64(key + '*' + value.value));
    })
    return str.join("|");
}
IdlersPocket._decryptVars = function (str) {
    Array.from(str.split("|"), (v) => b64_to_utf8(v)).forEach(function (item) {
        var parsed = 0;
        var itemArr = item.split('*');
        var n = IdlersPocket.vars.get(itemArr[0]);
        if (!IdlersPocket.vars.has(itemArr[0])) return;
        if (n.type == 'float') parsed = parseFloat(itemArr[1]);
        if (n.type == 'int') parsed = parseInt(itemArr[1]);
        if (n.type == 'string') parsed = itemArr[1];
        n.value = parsed;
    });
}

/**
 * Declares an variable.
 * @param {string} name - name of variable
 * @param {string} type - type of variable (int or float)
 */
IdlersPocket.newVar = function (name, type) {
    var n = { type: type, value: 0 };
    this.vars.set(name, n);
}

IdlersPocket.trackVars = function (obj, varList, objName) {
    var rname = objName ? '-' + objName : '';
    this.obj_track.push({ obj: obj, variables: varList, objName: rname });
    varList.forEach((v) => {
        IdlersPocket.newVar(v[0] + rname, v[1] ?? 'int');
    })
}

/**
 * Sets the variable.
 * @param {string} name - name of variable
 * @param {any} value - value of variable 
 */
IdlersPocket.setVar = function (name, value) {
    if (!this.vars.has(name)) return;
    this.vars.get(name).value = value;
}

/**
 * 
 */
IdlersPocket.hasVariable = function (name) {
    return this.vars.has(name);
}

/**
 * Returns the value of the variable corresponding to the name.
 * @param {string} name - name of variable 
 */
IdlersPocket.getVar = function (name, fb) {
    if (!this.vars.has(name)) {
        if (fb !== undefined) return fb;
        else return 0;
    }
    return (this.vars.get(name).type == 'string' ? String(this.vars.get(name).value) : this.vars.get(name).value);
}

IdlersPocket.loadCallback = function (callback) {
    this.loadCallbacks.push(callback);
}

IdlersPocket.saveCallback = function (callback) {
    this.saveCallbacks.push(callback);
}

function _formatEveryThirdPower(notations)
{
	return function (value)
	{
		var base = 0,
		notationValue = '';
		if (value >= 1000 && isFinite(value))
		{
			value /= 1000;
			while(Math.round(value) >= 1000)
			{
				value /= 1000;
				base++;
			}
			if (base > notations.length) {return 'Inf';} else {notationValue = notations[base];}
		}
		return ( Math.round(value * 10) / 10 ) + notationValue;
	};
}

function _rawFormatter(value) {return Math.round(value * 1000) / 1000;}

var _numberFormatters =
[
	_rawFormatter,
	_formatEveryThirdPower([
		' thousand',
		' million',
		' billion',
		' trillion',
		' quadrillion',
		' quintillion',
		' sextillion',
		' septillion',
		' octillion',
		' nonillion',
		' decillion'
	]),
	_formatEveryThirdPower([
		'k',
		'M',
		'B',
		'T',
		'Qa',
		'Qi',
		'Sx',
		'Sp',
		'Oc',
		'No',
		'Dc'
	])
];
IdlersPocket.nelBeautify = function(value,floats)
{
	var negative=(value<0);
	var decimal='';
	if (Math.abs(value)<1000 && floats>0) decimal='.'+(value.toFixed(floats).toString()).split('.')[1];
	value=Math.floor(Math.abs(value));
	var formatter=_numberFormatters[2];
	var output=formatter(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');
	if (output=='0') negative=false;
	return negative?'-'+output:output+decimal;
}

/**
 * more stuffs
 */

IdlersPocket.gcGainsHooks = [];
IdlersPocket.gcFreqHooks = [];
IdlersPocket.gcDurHooks = [];
IdlersPocket.buildingCpsHooks = [];
IdlersPocket.addGcHook = function (type, fun) {
    if (type == 'frequency') this.gcFreqHooks.push(fun);
    if (type == 'gains') this.gcGainsHooks.push(fun);
    if (type == 'effDuration') this.gcDurHooks.push(fun);
}

IdlersPocket.addCpsHook = function (building, fun) { this.buildingCpsHooks.push([building, fun]); }

function _activate(hooks, num) { var n = num; hooks.forEach((hook) => { n = hook(n); }); return n; }

IdlersPocket.activate = function (type, num) {
    if (type == 'frequency') return _activate(this.gcFreqHooks, num);
    if (type == 'gains') return _activate(this.gcGainsHooks, num);
    if (type == 'effDuration') return _activate(this.gcDurHooks, num);
    return num;
}

IdlersPocket.finalizeHooks = function () {
    Game.shimmerTypes.golden.popFunc = en.injectCode(Game.shimmerTypes.golden.popFunc, "if (Game.Has('Dragon fang')) mult*=1.03;",
        `\n\t\t\tmult=Game.Ip.activate('gains',mult);`, 'after');
    Game.shimmerTypes.golden.popFunc = en.injectCode(Game.shimmerTypes.golden.popFunc, "else effectDurMod*=Game.eff('wrathCookieEffDur');",
        `\n\t\t\teffectDurMod=Game.Ip.activate('effDuration',effectDurMod);`, 'after');
    Game.shimmerTypes.golden.getTimeMod = en.injectCode(Game.shimmerTypes.golden.getTimeMod, "if (Game.Has('Green yeast digestives')) m*=0.99;",
        `\n\t\t\tm=Game.Ip.activate('frequency',m);`, 'after');
    Game.magicCpS = function (what) {
        var mult = 1;
        Game.Ip.buildingCpsHooks.forEach(function (hook) { if (what == hook[0]) { mult *= hook[1](); } })
        return mult;
    }
}

l('sectionLeft').insertAdjacentHTML('afterbegin', '<div id="modinfo" style="position:absolute;top:0px;left:64px;z-index:100000;transform-origin:100% 0%;transform:scale(1.25);">');
IdlersPocket.modInfo = l('modinfo');
IdlersPocket.infoPanels = [];

IdlersPocket.newInfoPanel = function(nm, icon, tfunc, tid) {
    var id = this.infoPanels.length;
    this.infoPanels.push({name: nm, icon: icon, tooltipFunc: tfunc, textId: tid});
    this.modInfo.innerHTML += '<div class="crate enabled" style="opacity:1;float:none;display:block;margin:12px;'+writeIcon(icon)
        +'" '+Game.getDynamicTooltip('function(){return Game.Ip.infoPanels['+id+'].tooltipFunc();}', 'right', true)
        +'><div id="'+tid+'" style="bottom:-4px;left:0px;height:16px;width:48px;font-family:\'Merriweather\';font-size:9px;text-align:center;position:absolute;"></div></div>';
}

IdlersPocket.rebuildBigCookieButton = function () {
    l('bigCookie').remove();
    var bigCookie = document.createElement('button');
    bigCookie.id = 'bigCookie';
    l('cookieAnchor').appendChild(bigCookie);

    if (!Game.touchEvents) {
        AddEvent(bigCookie, 'click', Game.ClickCookie);
        AddEvent(bigCookie, 'mousedown', function (event) { Game.BigCookieState = 1; if (Game.prefs.cookiesound) { Game.playCookieClickSound(); } if (event) event.preventDefault(); });
        AddEvent(bigCookie, 'mouseup', function (event) { Game.BigCookieState = 2; if (event) event.preventDefault(); });
        AddEvent(bigCookie, 'mouseout', function (event) { Game.BigCookieState = 0; });
        AddEvent(bigCookie, 'mouseover', function (event) { Game.BigCookieState = 2; });
    }
    else {
        //touch events
        AddEvent(bigCookie, 'touchend', Game.ClickCookie);
        AddEvent(bigCookie, 'touchstart', function (event) { Game.BigCookieState = 1; if (event) event.preventDefault(); });
        AddEvent(bigCookie, 'touchend', function (event) { Game.BigCookieState = 0; if (event) event.preventDefault(); });
    }
}

// the function your father called
Game.getMilk = function () {
    Game.milkProgress = Game.AchievementsOwned / 25;
    var milkMult = 1;
    if (Game.Has('Santa\'s milk and cookies')) milkMult *= 1.05;
    milkMult *= 1 + Game.auraMult('Breath of Milk') * 0.05;
    if (Game.hasGod) {
        var godLvl = Game.hasGod('mother');
        if (godLvl == 1) milkMult *= 1.1;
        else if (godLvl == 2) milkMult *= 1.05;
        else if (godLvl == 3) milkMult *= 1.03;
    }
    milkMult *= Game.eff('milk');
    return milkMult * Game.milkProgress;
}

IdlersPocket.id = 0;
IdlersPocket.createLeftWidget = function (position, sprite, tooltipStr, clickStr) {
    var wrapper = document.createElement('div');
    wrapper.id = 'wrapper' + this.id;
    wrapper.style.cssText = 'position:absolute;bottom:' + position[0] + 'px;right:' + position[1] + 'px;z-index:100000;transform-origin:100% 0%;transform:scale(0.9);';
    wrapper.innerHTML = '<div id="widget' + this.id + '" class="crate heavenly" style="opacity:1;float:none;display:block;' + writeIcon(sprite) + '" '
        + Game.getDynamicTooltip(tooltipStr, 'top', true) + ' '
        + Game.clickStr + '="' + clickStr + '"></div>';
    l('sectionLeft').appendChild(wrapper);
    this.id++;
    return this.id - 1;
}

// patched orteil bs
eval('Game.CalculateGains='+Game.CalculateGains.toString().replace(
    "Game.cookiesPs=Game.runModHookOnValue('cps',Game.cookiesPs);",
        "mult*=(Game.cookiesPs>0?Game.runModHookOnValue('cps',Game.cookiesPs)/Game.cookiesPs:1);"));


IdlersPocket.ModLoaded=false;
IdlersPocket.LoadMod = function (name, initFunc) {

    var msave = function() {
        if (!IdlersPocket.ModLoaded) return '';
        IdlersPocket.saveCallbacks.forEach((c) => c());
        IdlersPocket.obj_track.forEach((me) => {
            me.variables.forEach((v) => {
                IdlersPocket.setVar(v[0]+me.objName, me.obj[v[0]]);
            })
        })
        return IdlersPocket._encryptVars();
    }

    var mload = function(str) {
        if (!IdlersPocket.ModLoaded) return;
        IdlersPocket._decryptVars(str);
        IdlersPocket.loadCallbacks.forEach((c) => c());
        IdlersPocket.obj_track.forEach((me) => {
            me.variables.forEach((v) => {
                me.obj[v[0]] = IdlersPocket.getVar(v[0]+me.objName, me.obj[v[0]]);
            })
        })
    }

    var mod = {
        initMod: initFunc,
        init: function () {
            window.scytheModWrapper = this;
            if ((localStorage.getItem('kzythe') === null)&&(!Game.modSaveData['ScytheMod'])){
                this.startingPrompt();
            } else {
                this.loadMod();
            }
        },
    
        save: msave,
        load: mload,
        loadMod: function () {
            Game.WriteSave();
		    Game.SaveTo = 'kzythe';
            this.initMod();
        },
        unloadMod: function() {
            delete Game.mods['ScytheMod'];
            delete window.mod;
        },
        startingPrompt: function () {
            Game.Prompt(`<id KzyLoadingPrompt>
                <h3>Welcome to ScytheMod</h3>
                <div class="block">
                    Some features of this mod require the usage of different save data. When the mod is unloaded, you can return to your vanilla Cookie Clicker save.
                    <div class="line"></div>
                    If you click "Continue", the mod will be loaded and a different save slot will be created.
                    <div class="line"></div>
                    Join our <a href="https://discord.gg/6eA8UQgaB8">Discord server</a>!
                    <div class="line"></div>
                    Credits: Hellranger for testing the mod, yeetdragon24 for 'helping' me make this prompt, leoguy for giving me a few ideas, and samyli for spritework.
                    If you've helped create the mod and your name isn't in the credits, it's probably due to laziness; feel free to ask me for attribution.
                </div>`,
            [['Continue','scytheModWrapper.loadMod();Game.ClosePrompt();'], ['No thanks','scytheModWrapper.unloadMod();Game.ClosePrompt();']]);
        }
    }
    Game.registerMod(name, mod);
}

IdlersPocket.Process = function() {
    this.finalizeHooks();
    this.rebuildBigCookieButton();
    Process(this);
}

export { IdlersPocket };