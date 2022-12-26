const fs = require('fs');

const dataLoad = require("./hgDataLoad.js");
const dataParse = require("./hgDataParse.js");

async function hungerGames(msg) {
    var hgGameData=await dataLoad.loadGames();
    var step=await dataParse.generateStep(hgGameData);
    await msg.reply(step);
    console.log("[HG]Done");
}


module.exports = {
    hungerGames
}