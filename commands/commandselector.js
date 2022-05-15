require('dotenv').config();
const Discord = require('discord.js');

const commandHandler = require('./commandhandler.js');
const mangaFind = require('../anime/mangaupdates/chapterfinder.js');
const youdl = require('../utility/youtubedl.js');
const anilistuserlist = require('../anime/anilist/anilistuserlist.js');
const dictionary = require('../utility/dictionary.js');
const characters = require('../anime/anilist/characters.js');
const bestrelease = require('../utility/bestrelease.js');
//const imgProcessing = require('./imageprocessing.js');


async function commandSelector(msg){
    var commandArgs = await commandHandler.commandHandler(msg).catch();
    const prefix = await process.env.BOT_PREFIX;


    switch (commandArgs.command.replace(prefix, "")) {
        case "test1":
            console.log("Command detected:"+ commandArgs.command)
            break;
        case "va":
            characters.getCharacters(msg,"", "notset").catch();
            break;
        case "manga":
            mangaFind(msg, commandArgs, "notset").catch();
            break;
        case "novel":
            mangaFind(msg, commandArgs, "notset").catch();
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
            dictionary(msg, "=definition ").catch();
            break;
        case "cspeed":
            //to be added
            break;
        case "anime":
            //to be added
            break;
        case "bestrelease":
            bestrelease.getBestRelease(msg, commandArgs).catch();
            break;
        case "":
            break;
        default:
            console.log("Unknown Command")
            break;
    }
}

module.exports = {
    commandSelector
}