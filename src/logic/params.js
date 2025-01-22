const fparams = {
    normal: {
        baseClicks: 250,
        baseRegen: Game.fps*4,
        baseRecovery: Game.fps*10,
        overflowGain: 0.35,
        overflowLoss: 0.2,
        baseThreshold: 0.3,
        overflowT: 1e5,
        cursorRate: Game.fps*15,
        shinyPower: [150, 60, 30, 15],
    },
    wst: {
        baseClicks: 100,
        baseRegen: Game.fps*7,
        baseRecovery: Game.fps*25,
        overflowGain: 0.7,
        overflowLoss: 0.2,
        baseThreshold: 0.7,
        overflowT: 100,
        cursorRate: Game.fps*8,
        shinyPower: [5, 5, 5, 5],
    },
    wstN: 2137
}

function ResetParams() {
    P=fparams.normal;
    if(Kaizo){
        P.baseClicks*=3;
        P.baseRegen*=0.25;
        P.baseRecovery*=0.5;
        P.cursorRate*=2;
    }
}


export {ResetParams}