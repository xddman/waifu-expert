require('dotenv').config({ path: __dirname + '/.env' });
const Discord = require('discord.js');

const commandHandler = require('./commandhandler.js');
const help = require('../utility/help.js');
const mangaFind = require('../anime/mangaupdates/chapterfinder.js');
const youdl = require('../utility/youtubedl.js');
const anilistuserlist = require('../anime/anilist/anilistuserlist.js');
const dictionary = require('../utility/dictionary.js');
const characters = require('../anime/anilist/voiceactors.js');
const characterlist = require('../anime/anilist/characters.js');
const anilistuserinfo = require('../anime/anilist/anilistuserinfo.js');
const animeinfo = require('../anime/anilist/animeinfo.js');
const animeratings = require('../anime/anilist/animeratings.js');
const followuser = require('../anime/anilist/followuser.js');
const getanilistid = require('../anime/anilist/anilistuserid.js');
const airing = require('../anime/anilist/airingbehind.js');
const bestrelease = require('../utility/bestrelease.js');
const anilistgetuserfollowers = require('../anime/anilist/anilistgetuserfollowers.js');
//const imgProcessing = require('./imageprocessing.js');
//const hungergames = require("../games/hungergames/hungerGames.js")


async function commandSelector(msg, client) {
    var commandArgs = await commandHandler.commandHandler(msg).catch((Exception) => { console.log(Exception) });
    const prefix = await process.env.BOT_PREFIX;


    switch (commandArgs.command.replace(prefix, "")) {
        case "reloadtest":
            console.log("test");
            break;
        case "va":
            characters.getCharacters(msg, "", "notset").catch((Exception) => { console.log(Exception) });
            break;
        case "manga":
            mangaFind(msg, commandArgs, "notset").catch((Exception) => { console.log(Exception) });
            break;
        case "novel":
            mangaFind(msg, commandArgs, "notset").catch((Exception) => { console.log(Exception) });
            break;
        case "count":
            //to be added
            break;
        case "milestonecomp":
            anilistuserlist(msg, commandArgs);
            break;
        case "milestoneall":
            anilistuserlist(msg, commandArgs);
            break;
        case "definition":
            dictionary(msg, commandArgs).catch((Exception) => { console.log(Exception) });
            break;
        case "cspeed":
            //to be added
            break;
        case "rating":
            animeratings.getRatings(msg, commandArgs, 0, 0).catch((Exception) => { console.log(Exception) });
            break;
        case "bestrelease":
            bestrelease.getBestRelease(msg, commandArgs).catch((Exception) => { console.log(Exception) });
            break;
        case "":
            // await followuser.checkUserServers(client).catch((Exception) => {console.log(Exception)});
            break;
        case "characters":
            characterlist.getCharacterList(msg, commandArgs).catch((Exception) => { console.log(Exception) });
            break;
        case "anilist":
            anilistuserinfo.userInfo(msg, commandArgs).catch((Exception) => { console.log(Exception) });
            break;
        case "setmyanilist":
            followuser.followUserAnilist(msg, commandArgs).catch((Exception) => { console.log(Exception) });
            break;
        case "deletemyanilist":
            followuser.DeleteAnilistToDatabase(msg, commandArgs).catch((Exception) => { console.log(Exception) });
            break;
        case "ratings":
            animeratings.getRatings(msg, commandArgs, 0, 0).catch((Exception) => { console.log(Exception) });
            break;
        case "getanilistid":
            await getanilistid(msg, commandArgs).catch((Exception) => { console.log(Exception) });
            //hungergames.hungerGames(msg).catch((Exception) => {console.log(Exception)});
            break;
        case "myratings":
            animeratings.getRatings(msg, commandArgs, 0, 0).catch((Exception) => { console.log(Exception) });
            //await anilistgetuserfollowers.sortUserIds(msg, commandArgs).catch((Exception) => {console.log(Exception)});
            //hungergames.hungerGames(msg).catch((Exception) => {console.log(Exception)});
            break;
        case "help":
            help.getHelp(msg, commandArgs).catch((Exception) => { console.log(Exception) });
            break;
        case "airingmissed":
            airing.listMissed(msg, commandArgs).catch((Exception) => { console.log(Exception) });
            break;
        default:
            console.log("Unknown Command")
            break;
    }
}

module.exports = {
    commandSelector
}