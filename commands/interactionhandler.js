const Discord = require('discord.js');
require('dotenv').config();

const mangaFind = require('../anime/mangaupdates/chapterfinder.js');
const characters = require('../anime/anilist/characters.js');

async function interactionHandler(interaction) {

    if (!interaction.isSelectMenu()) return;

    if (interaction.customId === process.env.BOT_INTERACTION_ID+1) {
        await mangaFind(interaction, "nocommand", "" + interaction.values[0]).catch();
    }
    if (interaction.customId === process.env.BOT_INTERACTION_ID+2) {
        //await characters.getCharacters(interaction, "nocommand", "" + interaction.values[0]).catch();
    }



}


module.exports = {
    interactionHandler
}