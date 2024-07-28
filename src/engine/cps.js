var cps_calculator={};

cps_calculator.replaceCpSFunc=function(){

}

cps_calculator.injectCpSFunc=function(origCode, injectedCode){
    return Function(`
        ${Game.CalculateGains.toString().replace(`var newShimmer=new Game.shimmer(i);`,
        injectedCode)}();
      `);
}