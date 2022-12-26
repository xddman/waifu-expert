require('dotenv').config({path: __dirname+'/.env'});
const Discord = require('discord.js');

const commandHandler = require('./commandhandler.js');
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
const bestrelease = require('../utility/bestrelease.js');


async function slashCommandSelector(msg, client){
    var commandArgs = await commandHandler.commandHandler(msg).catch((Exception) => {console.log(Exception)});
    const prefix = await process.env.BOT_PREFIX;

    
    switch (commandArgs.command.replace(prefix, "")) {
        case "test1":
            console.log("Command detected:"+ commandArgs.command)
            break;
        case "va":
            characters.getCharacters(msg,"", "notset").catch((Exception) => {console.log(Exception)});
            break;
        case "manga":
            mangaFind(msg, commandArgs, "notset").catch((Exception) => {console.log(Exception)});
            break;
        case "novel":
            mangaFind(msg, commandArgs, "notset").catch((Exception) => {console.log(Exception)});
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
            dictionary(msg, commandArgs).catch((Exception) => {console.log(Exception)});
            break;
        case "cspeed":
            //to be added
            break;
        case "rating":
            animeratings.getRatings(msg,commandArgs,0,0).catch((Exception) => {console.log(Exception)});
            break;
        case "bestrelease":
            bestrelease.getBestRelease(msg, commandArgs).catch((Exception) => {console.log(Exception)});
            break;
        case "":
           // await followuser.checkUserServers(client).catch((Exception) => {console.log(Exception)});
            break;
        case "characters":
            characterlist.getCharacterList(msg,commandArgs).catch((Exception) => {console.log(Exception)});
            break;
        case "anilist":
            anilistuserinfo.userInfo(msg,commandArgs).catch((Exception) => {console.log(Exception)});
            break;
        case "setmyanilist":
            followuser.followUserAnilist(msg,commandArgs).catch((Exception) => {console.log(Exception)});
            break;
        case "deletemyanilist":
            followuser.DeleteAnilistToDatabase(msg,commandArgs).catch((Exception) => {console.log(Exception)});
            break;
        case "ratings":
            animeratings.getRatings(msg,commandArgs,0,0).catch((Exception) => {console.log(Exception)});
            break;
        case "hungergames":
                //hungergames.hungerGames(msg).catch((Exception) => {console.log(Exception)});
                break;
        default:
            console.log("Unknown Command")
            break;
    }
}

module.exports = {
    slashCommandSelector
}