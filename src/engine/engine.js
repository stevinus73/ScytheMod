import {injectCode, injectCodes} from "./utils.js";
import { shimmer_engine } from "./shimmers.js";
import "./cps.js";
import "./constructs.js";

var IdlersPocket = {};

IdlersPocket._Initialize = function () {


    /**
     * STORAGE
     */

    IdlersPocket._save = function() {
        console.log('testing');
        return '';
    }

    IdlersPocket._load = function(str) {
        console.log('luarping');
    }

    IdlersPocket.injectCode = injectCode;
    IdlersPocket.injectCodes = injectCodes;
    IdlersPocket.shimmer_engine = shimmer_engine;

    IdlersPocket.ints=[];

    
    IdlersPocket._encryptInts = function() {}
    IdlersPocket._decryptInts = function() {}

    /**
     * Declares an int variable.
     * @param {string} name - name of variable
     */
    IdlersPocket.intVariable = function (name) {}

    /**
     * Sets the Int variable.
     * @param {string} name - name of variable
     * @param {int} value - value of variable 
     */
    IdlersPocket.setInt = function (name, value) {}

    /**
     * Returns an Int variable corresponding to the name.
     * @param {string} name - name of variable 
     */
    IdlersPocket.getInt = function (name) {}


    /**
     * ACHIEVEMENTS
     * (work on later)
     */

    IdlersPocket.Achievements = [];
    IdlersPocket.NameToId = {};
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
            this.Achievements.push(ach);
        });
        this.Achievements.sort((a, b) => a.id - b.id);
        this.Achievements.forEach(ach => this.NameToId[ach.name] = ach.id);
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