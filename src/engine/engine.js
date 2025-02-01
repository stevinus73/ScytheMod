import {injectCode, injectCodes} from "./utils.js";
import { building_engine, achiev_engine, upgrade_engine, Process } from "./constructs.js";
import "./constructs.js";

var IdlersPocket = {};

IdlersPocket._Initialize = function () {


    IdlersPocket.injectCode = injectCode;
    IdlersPocket.injectCodes = injectCodes;
    // honestly I don't really know too much about injectCode so I'm just making this for convenience
    IdlersPocket.injectMult = function(func, inject, ord) {
        var ret = func;
        inject.forEach(function(code) {
            ret = IdlersPocket.injectCode(ret, code[0], code[1], ord);
        })
        return ret;
    }
    IdlersPocket.injectChain = function(func, begin, chain) {
        var ret = func;
        var last = begin;
        chain.forEach(function(code) {
            ret = IdlersPocket.injectCode(ret, last, "\n\n\n\t"+code, "after");
            last = code;
        })
        return ret;
    }
    IdlersPocket.addLoc = function(loc1, loc2) {
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
    IdlersPocket.var_ident = [];
    Game.Ip = this;

    
    IdlersPocket._encryptVars = function() {
        return Array.from(this.vars.values(), (v) => utf8_to_b64(v.value)).join("|");
    }
    IdlersPocket._decryptVars = function(str) {
        Array.from(str.split("|"), (v) => b64_to_utf8(v)).forEach(function (item, index) {
            var parsed = 0;
            var n = IdlersPocket.vars.get(IdlersPocket.var_ident[index]);
            if (n.type == 'float') parsed = parseFloat(item);
            if (n.type == 'int') parsed = parseInt(item);
            n.value = parsed;
        });
    }

    /**
     * Declares an variable.
     * @param {string} name - name of variable
     * @param {string} type - type of variable (int or float)
     */
    IdlersPocket.newVar = function (name, type) {
        var n = {type: type, value: 0};
        this.vars.set(name, n);
        this.var_ident.push(name);
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
     * Returns the value of the variable corresponding to the name.
     * @param {string} name - name of variable 
     */
    IdlersPocket.getVar = function (name, fb) {
        if (!this.vars.has(name)) {
            if (fb!==undefined) return fb; 
            else return 0;
        }
        return this.vars.get(name).value;
    }

    IdlersPocket.loadCallback = function (callback) {
        this.loadCallbacks.push(callback);
    }

    IdlersPocket.saveCallback = function (callback) {
        this.saveCallbacks.push(callback);
    }

    /**
     * ACHIEVEMENTS
     * (work on later)
     */


    /**
     * more stuffs
     */

    IdlersPocket.gcGainsHooks=[];
    IdlersPocket.gcFreqHooks=[];
    IdlersPocket.buildingCpsHooks=[];
    IdlersPocket.addGcHook = function(type,fun) {
        if (type=='frequency') this.gcFreqHooks.push(fun);
        if (type=='gains') this.gcGainsHooks.push(fun);
    }

    IdlersPocket.addCpsHook = function(building,fun) {this.buildingCpsHooks.push([building,fun]);}

    function _activate(hooks,num){var n=num;hooks.forEach((hook)=>{n=hook(n);});return n;}

    IdlersPocket.activate = function(type, num) {
        if (type=='frequency') return _activate(this.gcFreqHooks, num);
        if (type=='gains') return _activate(this.gcGainsHooks, num);
        return num;
    }

    IdlersPocket.finalizeHooks = function() {
        Game.shimmerTypes.golden.popFunc = en.injectCode(Game.shimmerTypes.golden.popFunc, "if (Game.Has('Dragon fang')) mult*=1.03;",
        `\n\t\t\tmult=Game.Ip.activate('gains',mult);`, 'after')
        Game.shimmerTypes.golden.getTimeMod = en.injectCode(Game.shimmerTypes.golden.getTimeMod, "if (Game.Has('Green yeast digestives')) m*=0.99;",
        `\n\t\t\tm=Game.Ip.activate('frequency',m);`, 'after');
        Game.magicCpS=function(what) {
            var mult=1;
            Game.Ip.buildingCpsHooks.forEach(function(hook){if(what==hook[0]){mult=hook[1](mult);}})
            return mult;
        }
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
}

IdlersPocket._Initialize();



IdlersPocket.LoadMod = function (name, initFunc) {

    this._save = function() {
        IdlersPocket.saveCallbacks.forEach((c) => c());
        return IdlersPocket._encryptVars();
    }

    this._load = function(str) {
        IdlersPocket._decryptVars(str);
        IdlersPocket.loadCallbacks.forEach((c) => c());
    }

    var mod = {
        initMod: initFunc,
        init: function () {
            window.scytheModWrapper = this;
            if (localStorage.getItem('kzythe') === null){
                this.startingPrompt();
            } else {
                this.switchSave();
                this.initMod();
            }
        },
    
        save: this._save,
        load: this._load,
        switchSave: function () {
            Game.WriteSave();
		    Game.SaveTo = 'kzythe';
		    Game.LoadSave();
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
                    Credits: Hellranger for testing the mod, yeetdragon24 for 'helping' me make this prompt
                </div>`,
            [['Continue','scytheModWrapper.switchSave();scytheModWrapper.initMod();Game.ClosePrompt();'], ['No thanks','Game.ClosePrompt();']]);
        }
    }
    Game.registerMod(name, mod);
}

IdlersPocket.Process = function() {
    this.finalizeHooks();
    Process(this);
}

export { IdlersPocket };