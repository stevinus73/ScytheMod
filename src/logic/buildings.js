var buildings = {}

buildings._Initialize = function(en) {
    this.en = en;
    Game.UpdateMenu = en.injectCode(Game.UpdateMenu, "(dropMult!=1", `'<div class="listing"><b>'+loc("Missed golden cookies:")+'</b> '+Beautify(Game.missedGoldenClicks)+'</div>' + `, "before")
    console.log("Boop! Boop! Initializing!")
}

export { buildings }