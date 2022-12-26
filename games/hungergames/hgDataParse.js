var weightedRandom = require('weighted-random');

async function generateStep(gameData) {

    var randNum=Math.floor(Math.random() * 4);
    var eventType;
    if(randNum<3)
        eventType="normal";
    else if(randNum==3)
        eventType="deadly";


        var weights = gameData.events[eventType].map(function (gameDatas) {
            return gameDatas.chance;
        });
        var selectionIndex = weightedRandom(weights);
        var whatToWatch = gameData.events[eventType][selectionIndex].text;

        return whatToWatch;
}

module.exports = {
    generateStep
}