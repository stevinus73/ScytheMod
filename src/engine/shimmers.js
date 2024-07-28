var shimmer_engine={};

shimmer_engine.createShimmer=function(shimmerData){
    // placeholder
}

shimmer_engine.replaceShimmerFunc=function(injectedCode){
    return Function(`
        ${Game.updateShimmers.toString().replace(`var newShimmer=new Game.shimmer(i);`,
        injectedCode)}();
      `);
}