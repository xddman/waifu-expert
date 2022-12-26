//const Discord = require('discord.js');
require('dotenv').config({path: __dirname + '/.env'});

//const commandHandler = require('./commandhandler.js');
const mangaFind = require('../anime/mangaupdates/chapterfinder.js');
//const characters = require('../anime/anilist/voiceactors.js');
const animeRatings = require('../anime/anilist/animeratings.js');

    async function interactionHandler(interaction) {
        //var commandArgs = await commandHandler.commandHandler(msg).catch();

        //if (!interaction.isSelectMenu()) return;

        if (interaction.customId === process.env.BOT_INTERACTION_ID + 1 && interaction.isSelectMenu()) {
            await mangaFind(interaction, "nocommand", "" + interaction.values[0]).catch();
        }
        if (interaction.customId === process.env.BOT_INTERACTION_ID + 2 && interaction.isSelectMenu()) {
            //await characters.getCharacters(interaction, "nocommand", "" + interaction.values[0]).catch();
        }
        if (interaction.customId === process.env.BOT_INTERACTION_ID + 'PreviousPageRR') {
            animeRatings.handleRatingsInteractions(interaction, 0, 0, -1).catch((Exception) => {
                console.log(Exception)
            });
        }
        if (interaction.customId === process.env.BOT_INTERACTION_ID + 'NextPageRR') {
            animeRatings.handleRatingsInteractions(interaction, 0, 0, 1).catch((Exception) => {
                console.log(Exception)
            });

        }
        if (interaction.isCommand()) {
            const {commandName, options} = interaction;

            if (commandName === 'ping') {
                interaction.reply({
                    content: 'pong',
                    ephemeral: true
                });
            }
            if (commandName === 'ping1') {
                interaction.reply({
                    content: 'ping',
                    ephemeral: true
                });
            }
            if (commandName === 'ding') {
                interaction.reply({
                    content: 'ping' + interaction.options.getString('input'),
                    ephemeral: true
                });
            }


        }


    }


module.exports = {
    interactionHandler
}