const fs = require('fs');

async function loadGames() {
    let rawdata = fs.readFileSync(__dirname+'/games/default.json');
    let gameData = JSON.parse(rawdata);
    //console.log(gameData);
    return gameData;


}

module.exports = {
    loadGames
}