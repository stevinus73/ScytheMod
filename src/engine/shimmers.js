var shimmer_engine = {};

shimmer_engine.createShimmer = function (shimmerData) {
    // placeholder
}

shimmer_engine.replaceShimmerFunc = function (injectedCode) {
    return Function(`
        ${Game.updateShimmers.toString().replace(`var newShimmer=new Game.shimmer(i);`,
        injectedCode)}();
      `);
}

shimmer_engine.init = function () {

    //GOLDEN MANIP
    //let gc = Game.shimmerTypes['golden'];

    // the important part
    //gc.spawnConditions = function () {
    //    if (!Game.Has('Golden switch [on]')) return true; else return false;
    //};

}
