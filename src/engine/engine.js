import {injectCode, injectCodes} from "./utils.js";
import { shimmer_engine } from "./shimmers.js";
import { building_engine, upgrade_engine } from "./constructs.js";
import "./cps.js";
import "./constructs.js";

var IdlersPocket = {};

IdlersPocket._Initialize = function () {


    IdlersPocket.injectCode = injectCode;
    IdlersPocket.injectCodes = injectCodes;
    IdlersPocket.shim = shimmer_engine;
    IdlersPocket.be = building_engine;
    IdlersPocket.ue = upgrade_engine;

    /**
     * STORAGE
     */

    IdlersPocket.loadCallbacks = [];
    IdlersPocket.saveCallbacks = [];

    IdlersPocket._save = function() {
        this.saveCallbacks.forEach((c) => c());
        return this._encryptVars();
    }

    IdlersPocket._load = function(str) {
        this._decryptVars();
        this.loadCallbacks.forEach((c) => c());
    }

    IdlersPocket.vars = new Map();
    IdlersPocket.var_ident = [];

    
    IdlersPocket._encryptVars = function() {
        return Array.from(vars.values(), (v) => utf8_to_b64(v)).join("|");
    }
    IdlersPocket._decryptVars = function(str) {
        Array.from(str.split("|"), (v) => b64_to_utf8(v)).forEach(function (item, index) {
            parsed = 0;
            n = this.vars.get(this.var_ident[index]);
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
        this.vars.get(name).value = value;
    }

    /**
     * Returns the value of the variable corresponding to the name.
     * @param {string} name - name of variable 
     */
    IdlersPocket.getVar = function (name) {
        return this.vars.get(name).value;
    }

    IdlersPocket.loadCallback = function(callback) {
        loadCallbacks.push(callback);
    }

    IdlersPocket.saveCallback = function(callback) {
        saveCallbacks.push(callback);
    }

    /**
     * ACHIEVEMENTS
     * (work on later)
     */

    IdlersPocket.achievements = [];
    IdlersPocket.nameToId = {};
    IdlersPocket.Achievement = function (id, name, desc, icon, type, winCon) {
        this.id = id;
        this.name = name;
        this.desc = desc;
        this.icon = icon;
        this.type = type;
        if (winCon) this.winCon = winCon;
        return this;
    }

    IdlersPocket.Achievement.prototype.getType = function () {
        return 'achievement';
    }

    

    IdlersPocket._CreateAchievement = function (id, name, desc, icon, type, winCon) {

    }

    IdlersPocket._LoadAchievements = function () {
        var curr;
        var ach;
        Object.keys(Game.Achievements).forEach(function (key) {
            curr = Game.Achievements[key];
            ach = new this.Achievement(
                curr.order, curr.name, curr.desc, curr.icon.curr.pool
            )
            ach.won = curr.won;
            this.achievements.push(ach);
        });
        this.achievements.sort((a, b) => a.id - b.id);
        this.achievements.forEach(ach => this.nameToId[ach.name] = ach.id);
    }

    IdlersPocket.AddAchievement = function (prev, name, desc, icon, winCon) { }


    IdlersPocket.Achievement.prototype.pushToFront = function (id, name, desc, icon, type, winCon) { }
}



IdlersPocket.LoadMod = function (name, init) {
    this._Initialize();
    var mod = {
        init: function () {
            init();
        },
    
        save: this._save,
        load: this._load
    }
    Game.registerMod(name, mod);
}

export { IdlersPocket };